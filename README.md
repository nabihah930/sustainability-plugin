# Forge Hello World

This project contains a Forge app written in JavaScript that displays `Hello World!` in a Jira dashboard gadget.

See [developer.atlassian.com/platform/forge/](https://developer.atlassian.com/platform/forge) for documentation and tutorials explaining Forge.

## Requirements

See [Set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/) for instructions to get set up.

## Users
There could be 2 type of users: 
1. Jira development team
2. Jira (mod. plugin) team ~ Developer

## Quick start

## Jira Development team
- Make sure you're logged in using your Atlassian site credentials:
```
forge login
```
- 
- Install top-level dependencies:
```
npm install
```

## Developer Team

- Make sure you're logged in using your Atlassian site credentials:
```
forge login
```
- 
- Install top-level dependencies:
```
npm install
```

- Install dependencies (inside of the `static/hello-world` directory):
```
npm install
```
- If you have a backend and frontend folder:
  ```
cd 'backend' && npm install
cd 'frontend' && npm install

  ```
- Modify your app by editing the files in `static/hello-world/src/`.

- Build your app (inside of the `static/hello-world` directory):
```
npm run build
```

- Deploy your app by running:
```
forge deploy
```
- Optionally, deploy to a specific environment (e.g., development):

```
forge deploy -e development
```
- Install your app in an Atlassian site by running:
```
forge install
```
- You can also upgrade existing installations:
```
forge install --upgrade

```
- Web Triggers (Optional)

- Trigger via function key from manifest.yml
```
forge webtrigger -f <trigger_key_from_manifest>
```
- Or using a product:

```
forge webtrigger -p Jira
```

### Notes
- Use the `forge deploy` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new site.
- Use `forge tunne` for local development with live reloading.
- Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command.

## Support

See [Get help](https://developer.atlassian.com/platform/forge/get-help/) for how to get help and provide feedback.

