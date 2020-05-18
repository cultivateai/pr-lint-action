/* eslint-disable @typescript-eslint/camelcase */
import { GitHub } from "@actions/github/lib/github";
import * as core from "@actions/core";
import * as github from "@actions/github";

async function run(): Promise<void> {
  const githubContext = github.context;
  const githubToken = core.getInput("repo-token");
  const githubClient = new GitHub(githubToken);

  const pr = githubContext.issue;

  const titleRegex = new RegExp(core.getInput("title-regex"));
  const bodyRegex = new RegExp(core.getInput("body-regex"));
  const title: string = githubContext.payload.pull_request?.title ?? "";
  const body: string = githubContext.payload.pull_request?.body ?? "";

  const onFailedTitleRegexComment = core
    .getInput("on-failed-title-comment")
    .replace("%regex%", titleRegex.source);

  const onFailedBodyRegexComment = core
    .getInput("on-failed-body-comment")
    .replace("%regex%", titleRegex.source);

  core.debug(`Title Regex: ${titleRegex}`);
  core.debug(`Title: ${title}`);
  core.debug(`body Regex: ${bodyRegex}`);
  core.debug(`body: ${body}`);

  const titleMatchesRegex: boolean = titleRegex.test(title);
  const bodyMatchesRegex: boolean = bodyRegex.test(body);

  if (!titleMatchesRegex || !bodyMatchesRegex) {
    let errmsg: string = "";
    if (!titleMatchesRegex) {
      errmsg += onFailedTitleRegexComment + "\n"
    }
    if (!bodyMatchesRegex) {
      errmsg += onFailedBodyRegexComment + "\n"
    }

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
