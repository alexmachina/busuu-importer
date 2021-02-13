const fetch = require("node-fetch");
const fs = require("fs");
const chalk = require("chalk");
const inquirer = require("inquirer");
const cliProgress = require("cli-progress");
const chalkAnimation = require("chalk-animation");

class Todoist {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  baseHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  async addProject(name, parent) {
    try {
      const body = JSON.stringify({ name, parent_id: Number(parent) });
      const method = "POST";

      const headers = this.baseHeaders();
      const response = await fetch("https://api.todoist.com/rest/v1/projects", {
        method,
        body,
        headers,
      });

      if (response.status === 200) {
        const json = await response.json();
        return json;
      } else {
        const error = await response.text();
        throw error;
      }
    } catch (ex) {
      console.error("Erro ao criar projeto no Todoist", ex);
    }
  }

  async addTask(content, project_id) {
    try {
      const body = JSON.stringify({ content, project_id: Number(project_id) });
      const headers = this.baseHeaders();
      const method = "POST";
      const response = await fetch("https://api.todoist.com/rest/v1/tasks", {
        method,
        body,
        headers,
      });

      if (response.status === 200) {
        const json = await response.json();
        return json;
      } else {
        const error = response.text();
        throw error;
      }
    } catch (ex) {
      console.log(ex);
    }
  }

  async bulkTasks(tasks, projectId, name) {
    const snooze = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const b1 = new cliProgress.SingleBar({
      format:
        name +
        " - " +
        chalk.blue("{bar}") +
        " | {value} de {total} lições adicionadas",
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true,
    });

    b1.start(tasks.length, 0);
    for (let i = 0; i < tasks.length; i++) {
      await snooze(500);
      const task = tasks[i];
      await this.addTask(task, projectId);
      b1.increment();
    }
    b1.stop();
  }

  async getProjects() {
    const response = await fetch("https://api.todoist.com/rest/v1/projects", {
      method: "GET",
      headers: this.baseHeaders(),
    });
    const json = await response.json();
    console.log(json);
  }
}

const createMyProject = async (apiKey) => {
  const todoist = new Todoist(apiKey);

  const data = JSON.parse(fs.readFileSync("busuu.json", "utf-8"));
  const { id: rootProjectId, url } = await todoist.addProject(
    "Aprender Japonês ⛩"
  );

  for (const levelName in data) {
    const lessons = data[levelName];

    const { id: projectId } = await todoist.addProject(
      levelName,
      rootProjectId
    );

    await todoist.bulkTasks(lessons, projectId, levelName);
  }

  console.log(
    chalk.green("\nPronto! Seu projeto foi criado em:"),
    chalk.bold(`https://todoist.com/app/project/${rootProjectId}`)
  );
};

(async () => {
  console.log(
    `${chalk.italic(
      "\nブずウインポーター"
    )} \nby: アレックス https://github.com/alexmachina/`
  );
  const { apiKey } = await inquirer.prompt([
    {
      name: "apiKey",
      type: "password",
      message: `Digite sua 🔑 do ${chalk.redBright("Todoist")}:`,
    },
  ]);
  console.log(
    "\nCriando lições no Todoist... Vai tomar um café, aqui tem que demorar, senão a API deles explode."
  );
  await createMyProject(apiKey);
  console.log(`\n\n☯ Nos vemos no Japão ☯`);
  chalkAnimation.glitch("☯ 日本でお会いしましょう! ☯");
})();
