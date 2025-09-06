// utilities/logFailedPosts.ts
import fs from 'fs';
import path from 'path';

const failedPostsPath = path.join(__dirname, '../../logs/failed-posts-by-type.json');

let failedPostMap: Record<string, string[]> = {};

export function resetFailedPostsLog() {
  failedPostMap = {}; // reset in-memory
  fs.writeFileSync(failedPostsPath, JSON.stringify(failedPostMap, null, 2)); // overwrite file
}

export function logFailedPost(postType: string, postId: string) {
  if (!failedPostMap[postType]) {
    failedPostMap[postType] = [];
  }

  if (!failedPostMap[postType].includes(postId)) {
    failedPostMap[postType].push(postId);
    fs.writeFileSync(failedPostsPath, JSON.stringify(failedPostMap, null, 2));
  }
}
