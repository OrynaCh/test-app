import axios from "axios";

const USER_BASE_URL = "https://gitlab.com/api/v4/users/";

export class GitLabService implements IGitLabService {
  public async getUserProjects(userName: string, perPage = 10, pageNumber = 1):
    Promise<{ data: IProject[]; hasMore?: boolean; }> {
    const url = `${USER_BASE_URL}${encodeURIComponent(userName)}/` +
      `projects?per_page=${perPage}&page=${pageNumber}&order_by=id`;

    const response = await axios.get(url);
    const data = response.data.map((record: IGitLabProject) => ({
      description: record.description,
      name: record.name,
      readmeUrl: record.readme_url,
      repoUrl: record.http_url_to_reporecord,
      webUrl: record.web_url,
    }));

    return { data };
  }
}

export interface IGitLabService {
  getUserProjects(userName: string, perPage: number, pageNumber: number):
    Promise<{ data: IProject[]; hasMore?: boolean; }>;
}

interface IGitLabProject {
  description: string;
  name: string;
  readme_url: string;
  http_url_to_reporecord: string;
  web_url: string;
}

interface IProject {
  description: string;
  name: string;
  readmeUrl: string;
  repoUrl: string;
  webUrl: string;
}
