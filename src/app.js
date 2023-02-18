const core = require("@actions/core");
const github = require("@actions/github");
const discord = require("webhook-discord");
const process = require("process");

async function main() {
  const payload = github.context.payload;
  const jobstatus = core.getInput("job_status");
  let status = "Unknown";
  let color = "7289DA"

  if (jobstatus == "success") {
    color = "3066993";
    status = "Passed";
  } else if (jobstatus == "failure") {
    color = "15158332";
    status = "Failed";
  };

  const branch = payload.ref.split("/")[payload.ref.split("/").length - 1];
  const repository = payload.repository.full_name;
  const commits = payload.commits;
  const size = commits.length;
  const url = payload.compare;

  if (commits.length == 0) return core.warning(`Aborting analysis, found no commits.`);
  core.debug(`Received payload: ${JSON.stringify(payload, null, 2)}`);
  core.debug(`Received ${commits.length}/${size} commits...`);
  core.info("Constructing embed...");

  const embed = new discord.MessageBuilder()
    .setURL(url)
    .setColor(color)
    .setTitle(`⚡ ${size} ${size == 1 ? "Commit" : "Commits"}\n📁\`${repository}\`\n🌳 \`${branch}\``)
    .setDescription(getChangeLog(payload));

  core.info("Sending webhook message...");
  const Hook = new discord.Webhook(core.getInput("webhook_url"));
  Hook.send(embed);
};

function getChangeLog (payload) {
  core.info("Constructing Changelog...");
  const commits = payload.commits;
  let changelog = "";

  for (let i in commits) {
    if (i > 3) {
      changelog += `+ ${commits.length - i} more...\n`;
      break;
    };

    let commit = commits[i];
    const username = commit.author.username;

    let sha = commit.id.substring(0, 6);
    let message = commit.message.length > 128 ? commit.message.substring(0, 128) + "..." : commit.message;
    changelog += `[\`${sha}\`](${commit.url}) ${message} by _@${username}_\n`;
  }; return changelog;
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    core.setFailed(error)
    process.exit(1)
  });