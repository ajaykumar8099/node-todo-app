const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const app = express();
const format = require("date-fns/addDays");
const isMatch = require("date-fns/isMatch");
const isValid = require("date-fns/isValid");
const filePath = path.join(__dirname, "todoApplication.db");
let db = null;

const callDbFromNode = async () => {
  try {
    db = await open({
      filename: filePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server started Successfully");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
  }
};
callDbFromNode();

const hasPriorityStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const hasPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hasStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const hasCateStatus = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasCatePriority = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};
const hasSearch = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};
const hasCategoryPriority = (requestQuery) => {
  return requestQuery.category !== undefined;
};
const output = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    category: dbObject.category,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};
app.get("/todos/", async (request, response) => {
  let data = null;
  let query = "";
  const { search_q = "", priority, status, category } = request.query;
  switch (true) {
    case hasPriorityStatus(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          query = `SELECT * FROM todo WHERE status='${status}' AND priority='${priority}';`;
          data = await db.all(query);
          response.send(data.map((eachItem) => output(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case hasCateStatus(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          query = `SELECT * FROM todo WHERE category='${category}' AND status='${status}';`;
          data = await db.all(query);
          response.send(data.map((eachItem) => output(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasCategoryPriority(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          query = `SELECT * FROM todo WHERE category='${category}' AND priority='${priority}';`;
          data = await db.all(query);
          response.send(data.map((eachItem) => output(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasPriority(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        query = `SELECT * FROM todo WHERE priority='${priority}';`;
        data = await db.all(query);
        response.send(data.map((eachItem) => output(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasStatus(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        query = `SELECT * FROM todo WHERE status='${status}';`;
        data = await db.all(query);
        response.send(data.map((eachItem) => output(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasSearch(request.query):
      query = `SELECT * FROM todo WHERE todo like '%${search_q}%'`;
      data = await db.all(query);
      response.send(data.map((each) => output(each)));
      break;

    case hasCategoryPriority(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        query = `SELECT * FROM todo WHERE category='${category}'`;
        data = await db.all(query);
        response.send(data.map((each) => output(each)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    default:
      query = `SELECT * FROM todo`;
      data = await db.all(query);
      response.send(data.map((each) => output(each)));
  }
});
app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const query = `SELECT * FROM todo WHERE id=${todoId};`;
  const result = await db.get(query);
  response.send(output(result));
});
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  console.log(isMatch(date, "yyyy-MM-dd"));
  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    console.log(newDate);
    const reQuery = `SELECT * FROM todo WHERE due_date='${newDate}';`;
    const re = await db.all(reQuery);
    response.send(re.map((each) => output(each)));
  } else {
    response.status(400);
    response.status("Invalid Due Date");
  }
});
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  console.log(id);
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const postNewDate = format(new Date(dueDate), "yyyy-MM-dd");
          postTodoQuery = `INSERT INTO 
                        todo(id,todo,category,priority,status,due_date)
                        VALUES(${id},'${todo}','${category}','${priority}','${status}','${postNewDate}');`;
          await db.run(postTodoQuery);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let column = "";
  const requestBody = request.body;
  console.log(requestBody);
  const previousQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const previousTodo = await db.get(previousQuery);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = request.body;
  let updateQuery;
  switch (true) {
    case requestBody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        updateQuery = `UPDATE todo SET todo = '${todo}',priority = '${priority}',
                status = '${status}',category = '${category}', due_date = '${dueDate}'
                WHERE id = ${todoId};`;
        await db.run(updateQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case requestBody.priority !== undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        updateQuery = ` UPDATE todo SET 
                todo = ${todo}',priority = '${priority}',
                status = '${status}',category = '${category}', due_date = '${dueDate}'
                WHERE id = ${todoId};`;
        await db.run(updateQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case requestBody.todo !== undefined:
      updateQuery = ` UPDATE todo SET 
                todo = ${todo}',priority = '${priority}',
                status = '${status}',category = '${category}', due_date = '${dueDate}'
                WHERE id = ${todoId};`;
      await db.run(updateQuery);
      response.send("Todo Updated");
      break;
    case requestBody.category !== undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        updateQuery = ` UPDATE todo SET 
                    todo = ${todo}',priority = '${priority}',
                    status = '${status}',category = '${category}', due_date = '${dueDate}'
                    WHERE id = ${todoId};`;
        await db.run(updateQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDate = format(new Date(dueDate), "yyyy-MM-dd");
        updateQuery = ` UPDATE todo SET 
                    todo = ${todo}',priority = '${priority}',
                    status = '${status}',category = '${category}', due_date = '${dueDate}'
                    WHERE id = ${todoId};`;
        await db.run(updateQuery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
});
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `DELETE FROM todo WHERE id = ${todoId}`;
  await db.run(query);
  response.send("Todo Deleted");
});

module.exports = app;
