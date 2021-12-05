import * as express from "express";
import redis, {RedisClient} from "redis";
import {GitLabService, IGitLabService} from "../services/git-lab.service";

export class GitLabController {
  public projectsPath = "/gitlab/projects";
  public pingPath = "/ping";
  public router = express.Router();

  private _gitLabService: IGitLabService;
  private _redisClient: RedisClient;

  constructor() {
    this._initRedisConnection();
    this._gitLabService = new GitLabService();
    this._initRoutes();
  }

  private async _readUserProjects(req: express.Request, res: express.Response) {
    const {user: userName, page, perPage} = req.query;

    const key = `${userName}${perPage}${page}`;

    this._redisClient.get(key, async (err, projects) => {

      if (projects) {
        res.status(200).send({
          data: JSON.parse(projects),
        });
        return;
      }
      if (err) {
        res.status(500).send({message: err.message});
        return;
      }
      try {
        const result = await this._gitLabService.getUserProjects(
          userName as string,
          Number.isInteger(Number(perPage)) ? Number(perPage) : undefined,
          Number.isInteger(Number(page)) ? Number(page) : undefined,
        );
        this._redisClient.setex(key, 60, JSON.stringify(result.data));
        res.status(200).send({
          data: result.data,
          hasMore: result.hasMore,
        });
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });
  }

  private _initRoutes() {
    this.router.get(this.projectsPath, this._readUserProjects.bind(this));
    this.router.get(this.pingPath, this._sendPong.bind(this));
  }

  private _initRedisConnection() {
    const redisPort = 6379;
    this._redisClient = redis.createClient(redisPort);

    this._redisClient.on("error", (error: any) => {
      console.error(`Redis Error: ${error}`);
    });
  }

  private _sendPong(req: express.Request, res: express.Response) {
    res.status(200).json({ data: "pong" });
  }
}
