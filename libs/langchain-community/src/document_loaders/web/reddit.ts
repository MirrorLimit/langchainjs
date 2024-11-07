import { BaseDocumentLoader } from "@langchain/core/document_loaders/base";
import { RedditAPIWrapper,RedditPost  } from "../../utils/reddit";
import { Document } from "@langchain/core/documents";




class RedditPostsLoader extends BaseDocumentLoader {
  private apiWrapper: RedditAPIWrapper; //wrapper to fetch or search for posts
  private searchQueries: string[]; //"subreddits or usernames to load from
  private mode: string; //Can be "subreddit" or "username"
  private categories: string[]; //Only "controversial" "hot" "new" "rising" "top"
  private numberPosts: number; //max number of posts to load from each         
                                category-search query pair


  constructor(
    apiWrapper: RedditAPIWrapper,
    searchQueries: string[],
    mode: string,
    categories: string[] = ["new"],
    numberPosts: number = 10
  ) {
    super();
    this.apiWrapper = apiWrapper;
    this.searchQueries = searchQueries;
    this.mode = mode;
    this.categories = categories;
    this.numberPosts = numberPosts;
  }


  async load(): Promise<Document[]> {
    let results: Document[] = [];


    if (this.mode === "subreddit" || this.mode === "username") {
      for (const query of this.searchQueries) {
        for (const category of this.categories) {
          const posts = use apiWrapper to fetch numberPosts posts from the 
                        subreddit or username in query with category 
          results = results.concat(this._mapPostsToDocuments(posts, category));
        }
      }
    } else {
      throw new Error(
        "Invalid mode: please choose 'subreddit' or 'username'
      );
    }


    return results;
  }


  private _mapPostsToDocuments(posts: Post[], category: string): Document[] {
    return posts.map(
      (post) =>
        new Document({
          pageContent: post.selftext,
          metadata: {
            post_subreddit: post.subreddit_name_prefixed,
            post_category: category,
            post_title: post.title,
            post_score: post.score,
            post_id: post.id,
            post_url: post.url,
            post_author: post.author,
          },
        })
    );
  }
