import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddElectionToWatchlistData {
  userWatchlist_insert: UserWatchlist_Key;
}

export interface AddElectionToWatchlistVariables {
  electionId: UUIDString;
}

export interface Article_Key {
  id: UUIDString;
  __typename?: 'Article_Key';
}

export interface CandidateElection_Key {
  candidateId: UUIDString;
  electionId: UUIDString;
  __typename?: 'CandidateElection_Key';
}

export interface Candidate_Key {
  id: UUIDString;
  __typename?: 'Candidate_Key';
}

export interface Election_Key {
  id: UUIDString;
  __typename?: 'Election_Key';
}

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

export interface Issue_Key {
  id: UUIDString;
  __typename?: 'Issue_Key';
}

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

export interface UpdateCandidateBioData {
  candidate_update?: Candidate_Key | null;
}

export interface UpdateCandidateBioVariables {
  candidateId: UUIDString;
  newBio: string;
}

export interface UserWatchlist_Key {
  id: UUIDString;
  __typename?: 'UserWatchlist_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface ListAllElectionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllElectionsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllElectionsData, undefined>;
  operationName: string;
}
export const listAllElectionsRef: ListAllElectionsRef;

export function listAllElections(options?: ExecuteQueryOptions): QueryPromise<ListAllElectionsData, undefined>;
export function listAllElections(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAllElectionsData, undefined>;

interface GetMyWatchlistRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyWatchlistData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyWatchlistData, undefined>;
  operationName: string;
}
export const getMyWatchlistRef: GetMyWatchlistRef;

export function getMyWatchlist(options?: ExecuteQueryOptions): QueryPromise<GetMyWatchlistData, undefined>;
export function getMyWatchlist(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetMyWatchlistData, undefined>;

interface AddElectionToWatchlistRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddElectionToWatchlistVariables): MutationRef<AddElectionToWatchlistData, AddElectionToWatchlistVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddElectionToWatchlistVariables): MutationRef<AddElectionToWatchlistData, AddElectionToWatchlistVariables>;
  operationName: string;
}
export const addElectionToWatchlistRef: AddElectionToWatchlistRef;

export function addElectionToWatchlist(vars: AddElectionToWatchlistVariables): MutationPromise<AddElectionToWatchlistData, AddElectionToWatchlistVariables>;
export function addElectionToWatchlist(dc: DataConnect, vars: AddElectionToWatchlistVariables): MutationPromise<AddElectionToWatchlistData, AddElectionToWatchlistVariables>;

interface UpdateCandidateBioRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCandidateBioVariables): MutationRef<UpdateCandidateBioData, UpdateCandidateBioVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateCandidateBioVariables): MutationRef<UpdateCandidateBioData, UpdateCandidateBioVariables>;
  operationName: string;
}
export const updateCandidateBioRef: UpdateCandidateBioRef;

export function updateCandidateBio(vars: UpdateCandidateBioVariables): MutationPromise<UpdateCandidateBioData, UpdateCandidateBioVariables>;
export function updateCandidateBio(dc: DataConnect, vars: UpdateCandidateBioVariables): MutationPromise<UpdateCandidateBioData, UpdateCandidateBioVariables>;

