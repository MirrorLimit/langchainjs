import dotenv from 'dotenv';


dotenv.config();


interface RedditAPIConfig {
 clientId: string;
 clientSecret: string;
 userAgent: string;
}


interface RedditPost {
 title: string;
 selftext: string;
 subreddit_name_prefixed: string;
 score: number;
 id: string;
 url: string;
 author: string;
}


class RedditAPIWrapper {
 private clientId: string;
 private clientSecret: string;
 private userAgent: string;
 private token: string | null = null;
 private baseUrl: string = 'https://oauth.reddit.com';


 constructor(config: RedditAPIConfig) {
   this.clientId = config.clientId;
   this.clientSecret = config.clientSecret;
   this.userAgent = config.userAgent;
 }


 private async authenticate() {
  if (this.token) return;

  const authString = btoa(`${this.clientId}:${this.clientSecret}`);
  try {
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authString}`,
        'User-Agent': this.userAgent,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`Error authenticating with Reddit: ${response.statusText}`);
    }

    const data = await response.json();
    this.token = data.access_token;
  } catch (error) {
    console.error('Error authenticating with Reddit:', error);
  }
 }


 private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
  await this.authenticate();

  const url = new URL(`${this.baseUrl}${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'User-Agent': this.userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`Error making request to ${endpoint}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error making request to ${endpoint}:`, error);
    throw error;
  }
}


 async searchSubreddit(
   subreddit: string,
   query: string,
   sort: string = 'new',
   limit: number = 10,
   time: string = 'all'
 ): Promise<RedditPost[]> {
   const data = await this.makeRequest(`/r/${subreddit}/search`, {
     q: query,
     sort,
     limit,
     t: time,
   });

   return data.data.children.map((item: any) => ({
     title: item.data.title,
     selftext: item.data.selftext,
     subreddit_name_prefixed: item.data.subreddit_name_prefixed,
     score: item.data.score,
     id: item.data.id,
     url: item.data.url,
     author: item.data.author,
   }));
 }


 async fetchUserPosts(username: string, limit: number = 10, time: string = 'all'): Promise<RedditPost[]> {
   const data = await this.makeRequest(`/user/${username}/submitted`, {
    limit: limit.toString(),
    t: time,
  });


   return data.data.children.map((item: any) => ({
     title: item.data.title,
     selftext: item.data.selftext,
     subreddit_name_prefixed: item.data.subreddit_name_prefixed,
     score: item.data.score,
     id: item.data.id,
     url: item.data.url,
     author: item.data.author,
   }));
 }
}

export default RedditAPIWrapper;