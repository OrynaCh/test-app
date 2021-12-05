import App from "./app";
import { GitLabController } from "./src/controllers/gitlab.controller";

const app = new App(
  [
    new GitLabController(),
  ],
  3005,
);

app.listen();
