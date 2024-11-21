// import { describe, expect, it, jest } from "@jest/globals";
// import { RedditAPIWrapper, RedditAPIConfig, RedditPost } from "../reddit.js"; // Adjust path as needed
// import { AsyncCaller } from "@langchain/core/utils/async_caller";

// // Mocking global fetch for HTTP requests
// global.fetch = jest.fn();

// // Sample RedditAPIConfig for tests
// const fakeConfig: RedditAPIConfig = {
//   clientId: "fakeClientId",
//   clientSecret: "fakeClientSecret",
//   userAgent: "test-user-agent",
// };

// describe("RedditAPIWrapper", () => {
//   let redditAPIWrapper: RedditAPIWrapper;

//   beforeEach(() => {
//     redditAPIWrapper = new RedditAPIWrapper(fakeConfig);
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should authenticate successfully and set token", async () => {
//     const fakeAccessToken = "fakeAccessToken";
//     const fakeResponse = {
//       ok: true,
//       json: jest.fn().mockResolvedValue({ access_token: fakeAccessToken }),
//     };
//     (global.fetch as jest.Mock).mockResolvedValue(fakeResponse);

//     await redditAPIWrapper["authenticate"](); // Directly calling private method for testing

//     expect(global.fetch).toHaveBeenCalledWith(
//       "https://www.reddit.com/api/v1/access_token",
//       expect.objectContaining({
//         method: "POST",
//         headers: expect.objectContaining({
//           Authorization: expect.stringContaining("Basic"), // Checks if Basic auth is used
//         }),
//       })
//     );
//     expect(redditAPIWrapper["token"]).toBe(fakeAccessToken); // Ensure token is set
//   });

//   it("should make a request successfully", async () => {
//     const fakeToken = "fakeAccessToken";
//     redditAPIWrapper["token"] = fakeToken;
//     const fakeJsonResponse = { data: { children: [] } };
//     const fakeResponse = {
//       ok: true,
//       json: jest.fn().mockResolvedValue(fakeJsonResponse),
//     };
//     (global.fetch as jest.Mock).mockResolvedValue(fakeResponse);

//     const response = await redditAPIWrapper["makeRequest"]("/r/test/search", {
//       q: "test",
//     });

//     expect(global.fetch).toHaveBeenCalledWith(
//       "https://oauth.reddit.com/r/test/search?q=test",
//       expect.objectContaining({
//         headers: expect.objectContaining({
//           Authorization: `Bearer ${fakeToken}`,
//         }),
//       })
//     );
//     expect(response).toEqual(fakeJsonResponse);
//   });

//   it("should handle rate limit errors gracefully", async () => {
//     const fakeResponse = {
//       ok: false,
//       status: 429, // Rate limit exceeded
//       statusText: "Too Many Requests",
//     };
//     (global.fetch as jest.Mock).mockResolvedValue(fakeResponse);

//     try {
//       await redditAPIWrapper["makeRequest"]("/r/test/search", { q: "test" });
//     } catch (error) {
//       expect(error.message).toBe("Rate limit exceeded");
//     }
//   });

//   it("should search subreddit and map data correctly", async () => {
//     const fakeJsonResponse = {
//       data: {
//         children: [
//           {
//             data: {
//               title: "Test Post",
//               selftext: "Test Text",
//               subreddit_name_prefixed: "r/test",
//               score: 100,
//               id: "123",
//               url: "https://test.com",
//               author: "test_author",
//             },
//           },
//         ],
//       },
//     };

//     const fakeResponse = {
//       ok: true,
//       json: jest.fn().mockResolvedValue(fakeJsonResponse),
//     };

//     (global.fetch as jest.Mock).mockResolvedValue(fakeResponse);

//     const posts = await redditAPIWrapper.searchSubreddit("test", "test query");

//     expect(posts).toHaveLength(1);
//     expect(posts[0]).toEqual({
//       title: "Test Post",
//       selftext: "Test Text",
//       subreddit_name_prefixed: "r/test",
//       score: 100,
//       id: "123",
//       url: "https://test.com",
//       author: "test_author",
//     });
//   });

//   it("should fetch user posts and map data correctly", async () => {
//     const fakeJsonResponse = {
//       data: {
//         children: [
//           {
//             data: {
//               title: "User Post",
//               selftext: "User Post Text",
//               subreddit_name_prefixed: "r/test",
//               score: 50,
//               id: "456",
//               url: "https://test.com",
//               author: "user_test",
//             },
//           },
//         ],
//       },
//     };

//     const fakeResponse = {
//       ok: true,
//       json: jest.fn().mockResolvedValue(fakeJsonResponse),
//     };

//     (global.fetch as jest.Mock).mockResolvedValue(fakeResponse);

//     const posts = await redditAPIWrapper.fetchUserPosts("testuser", "new");

//     expect(posts).toHaveLength(1);
//     expect(posts[0]).toEqual({
//       title: "User Post",
//       selftext: "User Post Text",
//       subreddit_name_prefixed: "r/test",
//       score: 50,
//       id: "456",
//       url: "https://test.com",
//       author: "user_test",
//     });
//   });
// });
