const request = require("supertest");
const app = require("../../app");
const db = require("../models");

afterEach(async () => {
  const tableNames = Object.values(db)
    .filter((model) => !!model.tableName)
    .map((model) => `"${model.tableName}"`);
  await db.sequelize.query("TRUNCATE TABLE " + tableNames.join(", "));
});

afterAll(async () => {
  await db.sequelize.close();
});

describe("todos", () => {
  describe("GET /api/todos", () => {
    describe("when todo list is empty", () => {
      it("responds with an empty array", async () => {
        const res = await request(app).get("/api/todos");
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
      });
    });

    describe("when todo list is not empty", () => {
      beforeEach(async () => {
        await request(app).post("/api/todos").send({
          title: "First TODO",
        });
      });
      it("responds with an array of todos", async () => {
        const res = await request(app).get("/api/todos");
        expect(res.status).toBe(200);
        expect(res.body.length).toEqual(1);
      });
    });
  });

  describe("POST /api/todos", () => {
    let data = {
      title: "First TODO",
    };
    it("responds with created todo", async () => {
      const res = await request(app).post("/api/todos").send(data);
      expect(res.status).toBe(201);
    });
  });

  describe("GET /api/todos/:todoId", () => {
    let data = {
      title: "First TODO",
    };
    let todoId = 0;
    describe("when todo is missing", () => {
      it("responds with a 404", async () => {
        const res = await request(app).get(`/api/todos/${todoId}`);
        expect(res.status).toBe(404);
      });
    });
    describe("when todo is present", () => {
      beforeEach(async () => {
        const addResponse = await request(app).post("/api/todos").send(data);
        todoId = addResponse.body.id;
      });
      it("responds with a 200", async () => {
        const res = await request(app).get(`/api/todos/${todoId}`);
        expect(res.status).toBe(200);
      });
    });
  });

  describe("PUT /api/todos/:todoId", () => {
    let data = {
      title: "First TODO",
    };
    let update = {
      title: "First TODO (updated)",
    };
    let todoId = 0;
    describe("when todo is missing", () => {
      it("responds with a 404", async () => {
        const res = await request(app).put(`/api/todos/${todoId}`).send(update);
        expect(res.status).toBe(404);
      });
    });
    describe("when todo is present", () => {
      beforeEach(async () => {
        const addResponse = await request(app).post("/api/todos").send(data);
        todoId = addResponse.body.id;
      });
      it("responds with updated todo", async () => {
        const res = await request(app).put(`/api/todos/${todoId}`).send(update);
        expect(res.status).toBe(200);
        expect(res.body.title).toEqual(update.title);
      });
    });
  });

  describe("DELETE /api/todos/:todoId", () => {
    let data = {
      title: "First TODO",
    };
    let todoId = 0;
    describe("when todo is missing", () => {
      it("responds with a 404", async () => {
        const res = await request(app).delete(`/api/todos/${todoId}`);
        expect(res.status).toBe(404);
      });
    });
    describe("when todo is present", () => {
      beforeEach(async () => {
        const addResponse = await request(app).post("/api/todos").send(data);
        todoId = addResponse.body.id;
      });
      it("responds with a 200", async () => {
        const res = await request(app).delete(`/api/todos/${todoId}`);
        expect(res.status).toBe(204);
      });
    });
  });
});
