import prisma from "./lib/prisma.js";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { validator } from "hono/validator";
import { z } from "zod";
import { cors } from "hono/cors";
import { Server } from "socket.io";
import type { Server as HTTPServer } from "node:http";
import { groupBy } from "remeda";
import { endOfDay, format, startOfDay } from "date-fns";

const app = new Hono();

app.use("*", cors());

const port = 1340;

const httpServer = serve({
  fetch: app.fetch,
  port,
});

const io = new Server(httpServer as HTTPServer);

app.get("/", async (c) => {
  return c.json({
    message: "Worker healthy",
  });
});

const createProjectSchema = z.object({
  name: z.string(),
});

app.post(
  `/projects`,
  validator("json", (value, c) => {
    const parsed = createProjectSchema.safeParse(value);
    if (!parsed.success) {
      return c.text("Invalid!", 401);
    }
    return parsed.data;
  }),
  async (c) => {
    const body = c.req.valid("json");

    const project = await prisma.project.create({
      data: {
        name: body.name,
      },
    });

    return c.json(project);
  },
);

app.get(`/projects/:projectId`, async (c) => {
  const projectId = c.req.param("projectId");

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  return c.json(project);
});

const updateProjectSchema = z.object({
  name: z.string(),
});

app.put(
  `/projects/:projectId`,
  validator("json", (value, c) => {
    const parsed = updateProjectSchema.safeParse(value);
    if (!parsed.success) {
      return c.text("Invalid!", 401);
    }
    return parsed.data;
  }),
  async (c) => {
    const body = c.req.valid("json");
    const projectId = c.req.param("projectId");

    const project = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: body,
    });

    return c.json(project);
  },
);

app.delete(`/projects/:projectId`, async (c) => {
  const projectId = c.req.param("projectId");

  const project = await prisma.project.delete({
    where: {
      id: projectId,
    },
  });

  return c.json(project);
});

const createLogSchema = z.object({
  content: z.unknown().array(),
});

app.post(
  `/projects/:projectId/logs`,
  validator("json", (value, c) => {
    const parsed = createLogSchema.safeParse(value);
    if (!parsed.success) {
      return c.text("Invalid!", 401);
    }
    return parsed.data;
  }),
  async (c) => {
    const body = c.req.valid("json");
    const projectId = c.req.param("projectId");

    const log = await prisma.log.create({
      data: {
        content: {
          createMany: {
            data: body.content.map((item) => ({
              content:
                typeof item === "object" ? JSON.stringify(item) : String(item),
            })),
          },
        },
        project: {
          connect: {
            id: projectId,
          },
        },
      },
      include: {
        project: {
          select: {
            name: true,
            id: true,
          },
        },
        content: true,
      },
    });

    io.emit("new-log", {
      day: format(new Date(), "MMM d"),
      log,
    });

    return c.json(log);
  },
);

app.delete(`/projects/:projectId/logs`, async (c) => {
  const projectId = c.req.param("projectId");
  const dateString = c.req.query("date");

  const date = dateString ? new Date(dateString) : undefined;

  const logs = await prisma.log.deleteMany({
    where: {
      projectId,
      ...(date
        ? {
            createdAt: {
              gte: startOfDay(date),
              lte: endOfDay(date),
            },
          }
        : {}),
    },
  });

  return c.json(logs);
});

app.delete(`/logs/:logId`, async (c) => {
  const logId = c.req.param("logId");

  const log = await prisma.log.delete({
    where: {
      id: logId,
    },
  });

  return c.json(log);
});

app.get(`/projects/:projectId/logs`, async (c) => {
  const projectId = c.req.param("projectId");

  const logs = await prisma.log.findMany({
    where: {
      projectId,
    },
    include: {
      project: {
        select: {
          name: true,
          id: true,
        },
      },
      content: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return c.json(
    groupBy(logs, (log) => format(new Date(log.createdAt!), "MMM d")),
  );
});

app.get(`/logs`, async (c) => {
  const logs = await prisma.log.findMany();

  return c.json(logs);
});

app.get(`/logs/:logId`, async (c) => {
  const logId = c.req.param("logId");

  const log = await prisma.log.findUnique({
    where: {
      id: logId,
    },
  });

  return c.json(log);
});

app.get(`/projects`, async (c) => {
  const projects = await prisma.project.findMany();

  return c.json(projects);
});

app.get(`/projects/:projectId`, async (c) => {
  const projectId = c.req.param("projectId");

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  return c.json(project);
});

console.log(`Server is running on http://localhost:${port}`);
