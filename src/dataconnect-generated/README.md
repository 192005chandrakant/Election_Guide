# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListAllElections*](#listallelections)
  - [*GetMyWatchlist*](#getmywatchlist)
- [**Mutations**](#mutations)
  - [*AddElectionToWatchlist*](#addelectiontowatchlist)
  - [*UpdateCandidateBio*](#updatecandidatebio)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListAllElections
You can execute the `ListAllElections` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAllElections(options?: ExecuteQueryOptions): QueryPromise<ListAllElectionsData, undefined>;

interface ListAllElectionsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllElectionsData, undefined>;
}
export const listAllElectionsRef: ListAllElectionsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAllElections(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAllElectionsData, undefined>;

interface ListAllElectionsRef {
  ...
  (dc: DataConnect): QueryRef<ListAllElectionsData, undefined>;
}
export const listAllElectionsRef: ListAllElectionsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAllElectionsRef:
```typescript
const name = listAllElectionsRef.operationName;
console.log(name);
```

### Variables
The `ListAllElections` query has no variables.
### Return Type
Recall that executing the `ListAllElections` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAllElectionsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAllElectionsData {
  elections: ({
    id: UUIDString;
    name: string;
    electionDate: DateString;
    type: string;
    jurisdiction?: string | null;
    description?: string | null;
  } & Election_Key)[];
}
```
### Using `ListAllElections`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAllElections } from '@dataconnect/generated';


// Call the `listAllElections()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAllElections();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAllElections(dataConnect);

console.log(data.elections);

// Or, you can use the `Promise` API.
listAllElections().then((response) => {
  const data = response.data;
  console.log(data.elections);
});
```

### Using `ListAllElections`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAllElectionsRef } from '@dataconnect/generated';


// Call the `listAllElectionsRef()` function to get a reference to the query.
const ref = listAllElectionsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAllElectionsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.elections);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.elections);
});
```

## GetMyWatchlist
You can execute the `GetMyWatchlist` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getMyWatchlist(options?: ExecuteQueryOptions): QueryPromise<GetMyWatchlistData, undefined>;

interface GetMyWatchlistRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyWatchlistData, undefined>;
}
export const getMyWatchlistRef: GetMyWatchlistRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyWatchlist(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetMyWatchlistData, undefined>;

interface GetMyWatchlistRef {
  ...
  (dc: DataConnect): QueryRef<GetMyWatchlistData, undefined>;
}
export const getMyWatchlistRef: GetMyWatchlistRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyWatchlistRef:
```typescript
const name = getMyWatchlistRef.operationName;
console.log(name);
```

### Variables
The `GetMyWatchlist` query has no variables.
### Return Type
Recall that executing the `GetMyWatchlist` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyWatchlistData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetMyWatchlistData {
  userWatchlists: ({
    id: UUIDString;
    createdAt: TimestampString;
    election?: {
      id: UUIDString;
      name: string;
      electionDate: DateString;
    } & Election_Key;
      candidate?: {
        id: UUIDString;
        fullName: string;
        partyAffiliation: string;
      } & Candidate_Key;
        issue?: {
          id: UUIDString;
          name: string;
        } & Issue_Key;
  } & UserWatchlist_Key)[];
}
```
### Using `GetMyWatchlist`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyWatchlist } from '@dataconnect/generated';


// Call the `getMyWatchlist()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyWatchlist();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyWatchlist(dataConnect);

console.log(data.userWatchlists);

// Or, you can use the `Promise` API.
getMyWatchlist().then((response) => {
  const data = response.data;
  console.log(data.userWatchlists);
});
```

### Using `GetMyWatchlist`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyWatchlistRef } from '@dataconnect/generated';


// Call the `getMyWatchlistRef()` function to get a reference to the query.
const ref = getMyWatchlistRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyWatchlistRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.userWatchlists);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.userWatchlists);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## AddElectionToWatchlist
You can execute the `AddElectionToWatchlist` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
addElectionToWatchlist(vars: AddElectionToWatchlistVariables): MutationPromise<AddElectionToWatchlistData, AddElectionToWatchlistVariables>;

interface AddElectionToWatchlistRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddElectionToWatchlistVariables): MutationRef<AddElectionToWatchlistData, AddElectionToWatchlistVariables>;
}
export const addElectionToWatchlistRef: AddElectionToWatchlistRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addElectionToWatchlist(dc: DataConnect, vars: AddElectionToWatchlistVariables): MutationPromise<AddElectionToWatchlistData, AddElectionToWatchlistVariables>;

interface AddElectionToWatchlistRef {
  ...
  (dc: DataConnect, vars: AddElectionToWatchlistVariables): MutationRef<AddElectionToWatchlistData, AddElectionToWatchlistVariables>;
}
export const addElectionToWatchlistRef: AddElectionToWatchlistRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addElectionToWatchlistRef:
```typescript
const name = addElectionToWatchlistRef.operationName;
console.log(name);
```

### Variables
The `AddElectionToWatchlist` mutation requires an argument of type `AddElectionToWatchlistVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AddElectionToWatchlistVariables {
  electionId: UUIDString;
}
```
### Return Type
Recall that executing the `AddElectionToWatchlist` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddElectionToWatchlistData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddElectionToWatchlistData {
  userWatchlist_insert: UserWatchlist_Key;
}
```
### Using `AddElectionToWatchlist`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addElectionToWatchlist, AddElectionToWatchlistVariables } from '@dataconnect/generated';

// The `AddElectionToWatchlist` mutation requires an argument of type `AddElectionToWatchlistVariables`:
const addElectionToWatchlistVars: AddElectionToWatchlistVariables = {
  electionId: ..., 
};

// Call the `addElectionToWatchlist()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addElectionToWatchlist(addElectionToWatchlistVars);
// Variables can be defined inline as well.
const { data } = await addElectionToWatchlist({ electionId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addElectionToWatchlist(dataConnect, addElectionToWatchlistVars);

console.log(data.userWatchlist_insert);

// Or, you can use the `Promise` API.
addElectionToWatchlist(addElectionToWatchlistVars).then((response) => {
  const data = response.data;
  console.log(data.userWatchlist_insert);
});
```

### Using `AddElectionToWatchlist`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addElectionToWatchlistRef, AddElectionToWatchlistVariables } from '@dataconnect/generated';

// The `AddElectionToWatchlist` mutation requires an argument of type `AddElectionToWatchlistVariables`:
const addElectionToWatchlistVars: AddElectionToWatchlistVariables = {
  electionId: ..., 
};

// Call the `addElectionToWatchlistRef()` function to get a reference to the mutation.
const ref = addElectionToWatchlistRef(addElectionToWatchlistVars);
// Variables can be defined inline as well.
const ref = addElectionToWatchlistRef({ electionId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addElectionToWatchlistRef(dataConnect, addElectionToWatchlistVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userWatchlist_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userWatchlist_insert);
});
```

## UpdateCandidateBio
You can execute the `UpdateCandidateBio` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateCandidateBio(vars: UpdateCandidateBioVariables): MutationPromise<UpdateCandidateBioData, UpdateCandidateBioVariables>;

interface UpdateCandidateBioRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCandidateBioVariables): MutationRef<UpdateCandidateBioData, UpdateCandidateBioVariables>;
}
export const updateCandidateBioRef: UpdateCandidateBioRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateCandidateBio(dc: DataConnect, vars: UpdateCandidateBioVariables): MutationPromise<UpdateCandidateBioData, UpdateCandidateBioVariables>;

interface UpdateCandidateBioRef {
  ...
  (dc: DataConnect, vars: UpdateCandidateBioVariables): MutationRef<UpdateCandidateBioData, UpdateCandidateBioVariables>;
}
export const updateCandidateBioRef: UpdateCandidateBioRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateCandidateBioRef:
```typescript
const name = updateCandidateBioRef.operationName;
console.log(name);
```

### Variables
The `UpdateCandidateBio` mutation requires an argument of type `UpdateCandidateBioVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateCandidateBioVariables {
  candidateId: UUIDString;
  newBio: string;
}
```
### Return Type
Recall that executing the `UpdateCandidateBio` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateCandidateBioData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateCandidateBioData {
  candidate_update?: Candidate_Key | null;
}
```
### Using `UpdateCandidateBio`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateCandidateBio, UpdateCandidateBioVariables } from '@dataconnect/generated';

// The `UpdateCandidateBio` mutation requires an argument of type `UpdateCandidateBioVariables`:
const updateCandidateBioVars: UpdateCandidateBioVariables = {
  candidateId: ..., 
  newBio: ..., 
};

// Call the `updateCandidateBio()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateCandidateBio(updateCandidateBioVars);
// Variables can be defined inline as well.
const { data } = await updateCandidateBio({ candidateId: ..., newBio: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateCandidateBio(dataConnect, updateCandidateBioVars);

console.log(data.candidate_update);

// Or, you can use the `Promise` API.
updateCandidateBio(updateCandidateBioVars).then((response) => {
  const data = response.data;
  console.log(data.candidate_update);
});
```

### Using `UpdateCandidateBio`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateCandidateBioRef, UpdateCandidateBioVariables } from '@dataconnect/generated';

// The `UpdateCandidateBio` mutation requires an argument of type `UpdateCandidateBioVariables`:
const updateCandidateBioVars: UpdateCandidateBioVariables = {
  candidateId: ..., 
  newBio: ..., 
};

// Call the `updateCandidateBioRef()` function to get a reference to the mutation.
const ref = updateCandidateBioRef(updateCandidateBioVars);
// Variables can be defined inline as well.
const ref = updateCandidateBioRef({ candidateId: ..., newBio: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateCandidateBioRef(dataConnect, updateCandidateBioVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.candidate_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.candidate_update);
});
```

