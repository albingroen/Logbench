# Logbench (Worker)

This is the repository for the Logbench worker.
<br>
Are you looking for the [Logbench Desktop app](https://github.com/albingroen/logbench-app)?

## Running the worker

### Prereqs.

- Node LTS

### Installing dependencies

```
npm install
```

### Creating the SQLite database

```
npx prisma db push && npx prisma generate
```

### Running

```
npm start
```

Or if you want to make changes to the worker

```
npm run dev
```

## Examples on how to send logs to the worker

### TypeScript

```typescript
// lib/logbench.ts

import axios from "axios";

const url = process.env.EXPO_PUBLIC_LOGBENCH_WORKER_POST_LOGS_URL;

export function logbench(...content: unknown[]) {
  if (!url || typeof url !== "string") {
    console.info("Please set up a EXPO_PUBLIC_LOGBENCH_WORKER_POST_LOGS_URL variable");
    return;
  }

  axios.post(url, { content });
}
```

You get the POST Url by right clicking on a project:

![CleanShot 2024-12-18 at 10 15 12@2x](https://github.com/user-attachments/assets/d148a419-410f-45c2-bc46-a5b9c4ed834b)

Then you can use the function like this

```typescript
import { logbench } from "@lib/logbench"

logbench({
  this: {
    is: {
      my: {
        big: {
          object: true
        }
      }
    }
  }
})
```
