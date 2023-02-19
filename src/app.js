const core = require("@actions/core");
const github = require("@actions/github");
const discord = require("discord.js");
const process = require("process");

async function main() {
  const payload = github.context.payload;
  const jobstatus = core.getInput("job_status");
  let status = "Unknown";
  let color = "7289DA"

  if (jobstatus == "success") {
    color = "43B582";
    status = "Passed";
  } else if (jobstatus == "failure") {
    color = "F04A47";
    status = "Failed";
  };

  const branch = payload.ref.split("/")[payload.ref.split("/").length - 1];
  const commits = payload.commits;
  const size = commits.length;
  const url = payload.compare;

  if (commits.length == 0) return core.warning(`Aborting analysis, found no commits.`);
  core.debug(`Received payload: ${JSON.stringify(payload, null, 2)}`);
  core.debug(`Received ${commits.length}/${size} commits...`);
  core.info("Constructing embed...");

  let embed = new discord.EmbedBuilder()
    .setURL(url)
    .setColor(color)
    .setAuthor({name: `${status}: Deploy - ${payload.repository.full_name}`, iconURL: payload.sender.avatar_url, url: payload.sender.html_url})
    .setTitle(`[${payload.repository.name}:${branch}] ${size} ${size == 1 ? "new commit" : "new commits"}`)
    .setDescription(getChangeLog(payload))

  try {
    core.info("Preparing discord webhook client...");
    const client = new discord.WebhookClient({url: core.getInput("webhook_url")});

    core.info("Sending webhook message...");
    await client.send({
      embeds: [embed],
      username: "Github",
      avatarURL: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
    }).then(() => {core.info("Successfully sent the message!")}).catch((error) => {throw new Error(error)});
  } catch (error) {throw new Error(error)};
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
    let sha = commit.id.substring(0, 6);
    let message = commit.message.length > 128 ? commit.message.substring(0, 128) + "..." : commit.message;
    changelog += `[\`${sha}\`](${commit.url}) ${message} - ${payload.sender.login}\n`;
  }; return changelog;
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    core.setFailed(error)
    process.exit(1)
  });
