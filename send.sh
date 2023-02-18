#!/bin/bash
case ${1,,} in
    "success")
        EMBED_COLOR=3066993
        STATUS_MESSAGE="Passed"
        ;;

    "failure")
        EMBED_COLOR=15158332
        STATUS_MESSAGE="Failed"
        ;;

    *)
        STATUS_MESSAGE="Status Unknown"
        EMBED_COLOR=0
        ;;
esac

shift
if [ $# -lt 1 ]; then
  echo -e "WARNING!!\nYou need to pass the WEBHOOK_URL environment variable as the second argument to this script.\nFor details & guide, visit: https://github.com/DiscordHooks/github-actions-discord-webhook" && exit
fi

AUTHOR_NAME="$(git log -1 "$GITHUB_SHA" --pretty="%aN")"
COMMITTER_NAME="$(git log -1 "$GITHUB_SHA" --pretty="%cN")"
COMMIT_SUBJECT="$(git log -1 "$GITHUB_SHA" --pretty="%s")"
COMMIT_URL="https://github.com/$GITHUB_REPOSITORY/commit/$GITHUB_SHA"

# If, for example, $GITHUB_REF = refs/heads/feature/example-branch
# Then this sed command returns: feature/example-branch
BRANCH_NAME="$(echo $GITHUB_REF | sed 's/^[^/]*\/[^/]*\///g')"
REPO_URL="https://github.com/$GITHUB_REPOSITORY"
BRANCH_OR_PR="Branch"
BRANCH_OR_PR_URL="$REPO_URL/tree/$BRANCH_NAME"
ACTION_URL="$COMMIT_URL/checks"
COMMIT_OR_PR_URL=$COMMIT_URL
CREDITS="$AUTHOR_NAME authored & committed"


WEBHOOK_DATA='{
    "username": "GitHub Actions",
    "avatar_url": "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    "embeds": [{
        "author": {
            "icon_url": "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
            "name": "'"$STATUS_MESSAGE"': Deploy - '"$GITHUB_REPOSITORY"'",
            "url": "'$ACTION_URL'"
        },
        "color": '$EMBED_COLOR',
        "title": "'"[\`${BRANCH_NAME}\`](${BRANCH_OR_PR_URL})"'",
        "url": "'"https://github.com/$GITHUB_REPOSITORY/commit/$GITHUB_SHA"'",
        "description": "'"[\`${GITHUB_SHA:0:7}\`](https://github.com/$GITHUB_REPOSITORY/commit/$GITHUB_SHA)"' '"$COMMIT_SUBJECT"'",

        "fields": [
            {
                "name": "'"$BRANCH_OR_PR"'",
                "value": "'"[\`${BRANCH_NAME}\`](${BRANCH_OR_PR_URL})"'",
                "inline": true
            }
        ]
    }]
}'

for ARG in "$@"; do
    echo -e "[Webhook]: Sending webhook to Discord...\\n";
    (curl --fail --progress-bar -A "GitHub-Actions-Webhook" -H Content-Type:application/json -H X-Author:k3rn31p4nic#8383 -d "${WEBHOOK_DATA//	/ }" "$ARG" \
    && echo -e "\\n[Webhook]: Successfully sent the webhook.") || echo -e "\\n[Webhook]: Unable to send webhook."
done