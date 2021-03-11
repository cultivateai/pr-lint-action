/* eslint-disable @typescript-eslint/camelcase */
import { GitHub } from "@actions/github/lib/github";
import * as core from "@actions/core";
import * as github from "@actions/github";

async function run(): Promise<void> {
  const githubContext = github.context;
  const githubToken = core.getInput("repo-token");
  const githubClient = new GitHub(githubToken);
  const pr = githubContext.issue;
  const creator = githubContext.payload.sender?.login ?? "";
  const title: string = githubContext.payload.pull_request?.title ?? "";
  const body: string = githubContext.payload.pull_request?.body ?? "";

  const allowSkip = ['cultivatejenkins']

  let errmsg: string = "";

  // allow specific users to skip check
  if (!allowSkip.includes(creator)) {
    console.log("Title tests", core.getInput("title"))
    for (let item of JSON.parse(core.getInput("title"))) {
      console.log(item)
      let rg = new RegExp(item.regex)
      if (! rg.test(title)) {
        errmsg += "- " + item.comment + "\n"
      }
    }

    console.log("Body tests", core.getInput("body"))
    for (let item of JSON.parse(core.getInput("body"))) {
      console.log(item)
      let rg = new RegExp(item.regex)
      if (! rg.test(body)) {
        errmsg += "- " + item.comment + "\n"
      }
    }
  }

  if (errmsg != "") {
    githubClient.pulls.createReview({
      owner: pr.owner,
      repo: pr.repo,
      pull_number: pr.number,
      body: errmsg,
      event: "REQUEST_CHANGES",
    });
  } else {
    const reviews = await githubClient.pulls.listReviews({
      owner: pr.owner,
      repo: pr.repo,
      pull_number: pr.number,
    });

    reviews.data.forEach((review) => {
      if (review.user.login == "github-actions[bot]") {
        githubClient.pulls.dismissReview({
          owner: pr.owner,
          repo: pr.repo,
          pull_number: pr.number,
          review_id: review.id,
          message: "All good!",
        });
      }
    });
  }
}


run().catch((error) => {
  core.setFailed(error);
});
