import dotenv from 'dotenv';
//import { Buffer } from 'buffer';

dotenv.config();


export interface RedditAPIConfig {
 clientId: string;
 clientSecret: string;
 userAgent: string;
}


export interface RedditPost {
 title: string;
 selftext: string;
 subreddit_name_prefixed: string;
 score: number;
 id: string;
 url: string;
 author: string;
}


export class RedditAPIWrapper {
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
  // const authString = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

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

 private async waitForRateLimitReset() {
  const delay = Math.random() * 1000 + 5000; // Adding random delay to avoid bursts
  console.log(`Waiting for rate limit reset... retrying after ${delay}ms`);
  await new Promise(resolve => setTimeout(resolve, delay));
}

private async makeRequest( 
  endpoint: string, 
  params: Record<string, any> = {}, 
  retries: number = 5,
  delay: number = 1000): Promise<any> {
  await this.authenticate();

  const url = new URL(`${this.baseUrl}${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'User-Agent': this.userAgent,
        },
      });

      if (!response.ok) {
        if (response.status === 429) { // Rate Limit Exceeded
          await this.waitForRateLimitReset(); // Wait before retrying
          return await this.makeRequest(endpoint, params); // Retry the request
        }
        if (response.status >= 500) {  // Server errors
          console.error(`Server error: ${response.statusText}`);
          throw new Error(`Error making request to ${endpoint}: ${response.statusText}`);
        } else {
          throw new Error(`Error making request to ${endpoint}: ${response.statusText}`);
        }
      }

      return await response.json();
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed for request to ${endpoint}:`, error);

      // If last attempt, rethrow the error
      if (attempt === retries - 1) throw error;

      // Apply exponential back-off
      const jitter = Math.random() * 100; // Avoid bursts
      const backoffDelay = delay * (2 ** attempt) + jitter;
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
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
     restrict_sr: "on",
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


 async fetchUserPosts(username: string, sort: string = 'new', limit: number = 10, time: string = 'all'): Promise<RedditPost[]> {
   const data = await this.makeRequest(`/user/${username}/submitted`, {
    sort: sort,
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