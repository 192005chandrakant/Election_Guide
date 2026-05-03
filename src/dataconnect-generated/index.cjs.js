const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs, makeMemoryCacheProvider } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'electionguide',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;
const dataConnectSettings = {
  cacheSettings: {
    cacheProvider: makeMemoryCacheProvider()
  }
};
exports.dataConnectSettings = dataConnectSettings;

const listAllElectionsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllElections');
}
listAllElectionsRef.operationName = 'ListAllElections';
exports.listAllElectionsRef = listAllElectionsRef;

exports.listAllElections = function listAllElections(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listAllElectionsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const getMyWatchlistRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyWatchlist');
}
getMyWatchlistRef.operationName = 'GetMyWatchlist';
exports.getMyWatchlistRef = getMyWatchlistRef;

exports.getMyWatchlist = function getMyWatchlist(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(getMyWatchlistRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const addElectionToWatchlistRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddElectionToWatchlist', inputVars);
}
addElectionToWatchlistRef.operationName = 'AddElectionToWatchlist';
exports.addElectionToWatchlistRef = addElectionToWatchlistRef;

exports.addElectionToWatchlist = function addElectionToWatchlist(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(addElectionToWatchlistRef(dcInstance, inputVars));
}
;

const updateCandidateBioRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateCandidateBio', inputVars);
}
updateCandidateBioRef.operationName = 'UpdateCandidateBio';
exports.updateCandidateBioRef = updateCandidateBioRef;

exports.updateCandidateBio = function updateCandidateBio(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateCandidateBioRef(dcInstance, inputVars));
}
;
