import axios, { AxiosResponse } from 'axios';
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
   //authentication
 }


 private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
   await this.authenticate();


   try {
     const response = await axios.get(`${this.baseUrl}${endpoint}`, {
       headers: {
         Authorization: `Bearer ${this.token}`,
         'User-Agent': this.userAgent,
       },
       params,
     });
     return response.data;
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
}


export default RedditAPIWrapper;