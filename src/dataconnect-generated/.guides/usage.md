# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { listAllElections, getMyWatchlist, addElectionToWatchlist, updateCandidateBio } from '@dataconnect/generated';


// Operation ListAllElections: 
const { data } = await ListAllElections(dataConnect);

// Operation GetMyWatchlist: 
const { data } = await GetMyWatchlist(dataConnect);

// Operation AddElectionToWatchlist:  For variables, look at type AddElectionToWatchlistVars in ../index.d.ts
const { data } = await AddElectionToWatchlist(dataConnect, addElectionToWatchlistVars);

// Operation UpdateCandidateBio:  For variables, look at type UpdateCandidateBioVars in ../index.d.ts
const { data } = await UpdateCandidateBio(dataConnect, updateCandidateBioVars);


```