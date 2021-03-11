"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const github_1 = require("@actions/github/lib/github");
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
async function run() {
    var _a, _b, _c, _d, _e, _f;
    const githubContext = github.context;
    const githubToken = core.getInput("repo-token");
    const githubClient = new github_1.GitHub(githubToken);
    const pr = githubContext.issue;
    const creator = (_b = (_a = githubContext.payload.sender) === null || _a === void 0 ? void 0 : _a.login) !== null && _b !== void 0 ? _b : "";
    const title = (_d = (_c = githubContext.payload.pull_request) === null || _c === void 0 ? void 0 : _c.title) !== null && _d !== void 0 ? _d : "";
    const body = (_f = (_e = githubContext.payload.pull_request) === null || _e === void 0 ? void 0 : _e.body) !== null && _f !== void 0 ? _f : "";
    const allowSkip = ['cultivatejenkins'];
    let errmsg = "";
    if (!allowSkip.includes(creator)) {
        console.log("Title tests", core.getInput("title"));
        for (let item of JSON.parse(core.getInput("title"))) {
            console.log(item);
            let rg = new RegExp(item.regex);
            if (!rg.test(title)) {
                errmsg += "- " + item.comment + "\n";
            }
        }
        console.log("Body tests", core.getInput("body"));
        for (let item of JSON.parse(core.getInput("body"))) {
            console.log(item);
            let rg = new RegExp(item.regex);
            if (!rg.test(body)) {
                errmsg += "- " + item.comment + "\n";
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
    }
    else {
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
