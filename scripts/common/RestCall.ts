import { authTokenManager } from "VSS/Authentication/Services";

// Get auth token from VSS to be able to make api calls
function getAuthHeader() {
	return new Promise((resolve, reject) => {
		VSS.getAccessToken().then(token => {
			let authHeader = authTokenManager.getAuthorizationHeader(token);
			resolve(authHeader);
        });
	});
}

// Api call to an Azure Devops/TFS Api endpoint
async function restApiCall(url) {
	const authHeader = await getAuthHeader();
	let requestHeaders: any = { 'Content-Type': 'application/json',
								 Authorization: authHeader};

	return fetch(url, { headers: requestHeaders }).then(x => x.json());
}

// Get list of projects
export function getProjects(context, isOnPrem) {
	let url = "";
	if (isOnPrem) {
		url = getProjectsUrlOnPrem(context.collection.uri); 
	} else {
		url = getProjectsUrl(context.collection.name);
	}

	return restApiCall(url).then(result => {
		if (!result || !result.value) {
			return Promise.reject("Error occured");
		}
		else {
			return Promise.resolve(result.value);
		}
	})
}

// Get list of release definitions tied to a project
export function getReleaseDefinitions(context, projectname, isOnPrem) {
	let url = "";
	if (isOnPrem) {
		url = getReleaseDefinitionsUrlOnPrem(context.collection.uri, projectname);
	} else {
		url = getReleaseDefinitionsUrl(context.collection.name, projectname);
	}

	return restApiCall(url).then(result => {
		if (!result || !result.value) {
			return Promise.reject("Error occured");
		} else {
			return Promise.resolve(result.value);
		}
	})
}

// Get the latest deployment of an environment
export function getLatestDeployment(context, projectname, releaseid, isOnPrem) {
	let url = "";
	if (isOnPrem) {
		url = getLatestDeploymentURLOnPrem(context.collection.uri, projectname, releaseid);
	} else {
		url = getLatestDeploymentURL(context.collection.name, projectname, releaseid);
	}

	return restApiCall(url).then(result => {
		if (!result || !result.value) {
			return Promise.reject("Error occured");
		} else {
			return Promise.resolve(result.value);
		}
	})
}

// Get the latest release information tied to a project/release definition/environment
export function getLatestRelease(context, projectname, releaseid, environmentid, isOnPrem) {
	let url = "";
	if (isOnPrem) {
		url = getLatestReleaseURLOnPrem(context.collection.uri, projectname, releaseid, environmentid);
	} else {
		url = getLatestReleaseURL(context.collection.name, projectname, releaseid, environmentid);
	}

	return restApiCall(url).then(result => {
		if (!result || !result.value) {
			return Promise.reject("Error occured");
		} else {
			return Promise.resolve(result.value);
		}
	})
}

// Get latest release tied to a project/release definition/environment 
export function getLatestReleaseEnvironment(context, projectname, releaseid, environmentid, isOnPrem) {
	let url = "";
	if (isOnPrem) {
		url = getLatestReleaseEnvironmentURLOnPrem(context.collection.uri, projectname, releaseid, environmentid);
	} else {
		url = getLatestReleaseEnvironmentURL(context.collection.name, projectname, releaseid, environmentid);
	}

	return restApiCall(url).then(result => {
		if (!result) {
			return Promise.reject("Error occured");
		} else {
			let arr = [];
			arr.push(result);
			return Promise.resolve(arr);
		}
	})
}

// Get list of release environments tied to a particular release definition
export function getReleaseEnvironments(context, projectname, releaseid, isOnPrem) {
	let url = "";
	if (isOnPrem) {
		url = getReleaseEnvironmentsUrlOnPrem(context.collection.uri, projectname, releaseid);
	} else {
		url = getReleaseEnvironmentsUrl(context.collection.name, projectname, releaseid);
	}

	return restApiCall(url).then(result => {
		if (!result || !result.environments) {
			return Promise.reject("Error occured");
		} else {
			return Promise.resolve(result.environments);
		}
	})
}


//	**********************
//	Rest Api Url Endpoints API
//	**********************

//	Azure DevOps

export function getReleaseDefinitionsUrl(collectionname, projectname) {
	  return `https://vsrm.dev.azure.com/${collectionname}/${projectname}/_apis/Release/definitions`;
}

export function getReleaseEnvironmentsUrl(collectionname, projectname, releaseid) {
	  return `https://vsrm.dev.azure.com/${collectionname}/${projectname}/_apis/release/definitions/${releaseid}`;
}

export function getProjectsUrl(collectionname) {
	  return `https://dev.azure.com/${collectionname}/_apis/projects`;
}

export function getLatestDeploymentURL(collectionname, projectname, releaseid) {
	  return `https://vsrm.dev.azure.com/${collectionname}/${projectname}/_apis/release/deployments?definitionId=${releaseid}&$top=1`; //default order is descending
}

export function getLatestReleaseURL(collectionname, projectname, releaseid, environmentid) {
	  return `https://vsrm.dev.azure.com/${collectionname}/${projectname}/_apis/release/deployments?definitionId=${releaseid}&$top=1&definitionEnvironmentId=${environmentid}&queryorder=descending`;
}

export function getLatestReleaseEnvironmentURL(collectionname, projectname, releaseid, environmentid) {
	  return `https://vsrm.dev.azure.com/${collectionname}/${projectname}/_apis/release/releases/${releaseid}/environments/${environmentid}`;
}

export function createLogUrl(collectionname, projectname, releaseid, environmentid): string {
	return `https://${collectionname}.visualstudio.com/${projectname}/_releaseProgress?_a=release-environment-logs&releaseId=${releaseid}&environmentId=${environmentid}`;
}

//

// On Prem

export function getReleaseDefinitionsUrlOnPrem(collectionUri, projectname) {
	  return `${collectionUri}${projectname}/_apis/Release/definitions`;
}

export function getReleaseEnvironmentsUrlOnPrem(collectionUri, projectname, releaseid) {
	  return `${collectionUri}${projectname}/_apis/release/definitions/${releaseid}`;
}

export function getProjectsUrlOnPrem(collectionUri) {
	  return `${collectionUri}_apis/projects`;
}

export function getLatestDeploymentURLOnPrem(collectionUri, projectname, releaseid) {
	  return `${collectionUri}${projectname}/_apis/release/deployments?definitionId=${releaseid}&$top=1`; //default order is descending
}

export function getLatestReleaseURLOnPrem(collectionUri, projectname, releaseid, environmentid) {
	  return `${collectionUri}${projectname}/_apis/release/deployments?definitionId=${releaseid}&$top=1&definitionEnvironmentId=${environmentid}&queryorder=descending`;
}

export function getLatestReleaseEnvironmentURLOnPrem(collectionUri, projectname, releaseid, environmentid) {
	  return `${collectionUri}${projectname}/_apis/release/releases/${releaseid}/environments/${environmentid}`;
}

export function createLogUrlOnPrem(collectionUri, projectname, releaseid, environmentid): string {
	return `${collectionUri}${projectname}/_releaseProgress?_a=release-environment-logs&releaseId=${releaseid}&environmentId=${environmentid}`;
}

export function createLogUrlOnPremForTFS2018U1AndBelow(collectionUri, projectname, releaseid, releasedefinitionid): string {
	return `${collectionUri}${projectname}/_apps/hub/ms.vss-releaseManagement-web.hub-explorer?releaseId=${releaseid}&definitionId=${releasedefinitionid}&_a=release-logs`;
	//return `${collectionUri}${projectname}/_apps/hub/ms.vss-releaseManagement-web.hub-explorer?releaseId=${releaseid}&definitionId=${releasedefinitionid}&_a=release-summary`;
}
//	**********************
//	**********************
