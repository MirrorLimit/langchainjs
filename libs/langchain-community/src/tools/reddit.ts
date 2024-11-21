// Imports for API wrapper; may need to change if location is incorrect
import { RedditAPIWrapper } from "@langchain/community/utils/reddit.ts";

import { Tool } from "@langchain/core/tools";

/*  Interface for the search parameters.
 *  sortMethod: The sorting method for the search results, can be one of "relevance", "hot", "top", "new", "comments"
 *  time: The time period for the search results, can be one of "hour", "day", "week", "month", "year", "all"
 *  subreddit: The subreddit to search in like "dankmemes" for "r/dankmemes"
 *  limit: The number of results to return
 *  clientId: The client ID for the Reddit API
 *  clientSecret: The client secret for the Reddit API
 *  userAgent: The user agent for the Reddit API
 */
export interface RedditSearchRunParams {
  sortMethod?: string;
  time?: string;
  subreddit?: string;
  limit?: number;
  clientId?: string;
  clientSecret?: string;
  userAgent?: string;
}

export class RedditSearchRun extends Tool {
  static lc_name() {
    return "RedditSearchRun";
  }

  name = "Reddit_search";

  description = "A tool for searching reddit posts using the reddit API";

  // Default values for the search parameters
  protected sortMethod = "relevance";
  protected time = "all";
  protected subreddit = "all";
  protected limit = 2;
  protected clientId = "";
  protected clientSecret = "";
  protected userAgent = "";

  /**
   * Constructor for the RedditSearchRun class
   * @description Initializes the search parameters if given
   * @param params The search parameters
   */
  constructor(params: RedditSearchRunParams = {}) {
    super();

    this.sortMethod = params.sortMethod ?? this.sortMethod;
    this.time = params.time ?? this.time;
    this.subreddit = params.subreddit ?? this.subreddit;
    this.limit = params.limit ?? this.limit;
    this.clientId = params.clientId ?? this.clientId;
    this.clientSecret = params.clientSecret ?? this.clientSecret;
    this.userAgent = params.userAgent ?? this.userAgent;
  }

  /**
   * @param {string} query The search query to be sent to reddit
   * @description Function to retrieve posts based on a search query
   * @returns the search results from using the API wrapper
   */
  async _call(query: string): Promise<any> {
    const apiWrapper = new RedditAPIWrapper({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      userAgent: this.userAgent,
    });

    return apiWrapper.searchSubreddit(
      this.subreddit,
      query,
      this.sortMethod,
      this.limit,
      this.time
    );
  }

  /**
   * @param {string} username The username whose posts are to be retrieved
   * @param {number} limit The number of posts to retrieve starting from the latest post
   * @param {string} time The time period for the posts to be retrieved
   * @description Function to retrieve posts from a certain user
   * @returns The latest limit number of posts from the user
   */
  async _fetchUserPosts(
    username: string,
    limit: number = this.limit,
    time: string = this.time
  ): Promise<any> {
    const apiWrapper = new RedditAPIWrapper({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      userAgent: this.userAgent,
    });

    return apiWrapper.fetchUserPosts(username, limit, time);
  }
}
