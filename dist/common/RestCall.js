var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "VSS/Authentication/Services"], function (require, exports, Services_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Get auth token from VSS to be able to make api calls
    function getAuthHeader() {
        return new Promise(function (resolve, reject) {
            VSS.getAccessToken().then(function (token) {
                var authHeader = Services_1.authTokenManager.getAuthorizationHeader(token);
                resolve(authHeader);
            });
        });
    }
    // Api call to an Azure Devops/TFS Api endpoint
    function restApiCall(url) {
        return __awaiter(this, void 0, void 0, function () {
            var authHeader, requestHeaders;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getAuthHeader()];
                    case 1:
                        authHeader = _a.sent();
                        requestHeaders = { 'Content-Type': 'application/json',
                            Authorization: authHeader };
                        return [2 /*return*/, fetch(url, { headers: requestHeaders }).then(function (x) { return x.json(); })];
                }
            });
        });
    }
    // Get list of projects
    function getProjects(context, isOnPrem) {
        var url = "";
        if (isOnPrem) {
            url = getProjectsUrlOnPrem(context.collection.uri);
        }
        else {
            url = getProjectsUrl(context.collection.name);
        }
        return restApiCall(url).then(function (result) {
            if (!result || !result.value) {
                return Promise.reject("Error occured");
            }
            else {
                return Promise.resolve(result.value);
            }
        });
    }
    exports.getProjects = getProjects;
    // Get list of release definitions tied to a project
    function getReleaseDefinitions(context, projectname, isOnPrem) {
        var url = "";
        if (isOnPrem) {
            url = getReleaseDefinitionsUrlOnPrem(context.collection.uri, projectname);
        }
        else {
            url = getReleaseDefinitionsUrl(context.collection.name, projectname);
        }
        return restApiCall(url).then(function (result) {
            if (!result || !result.value) {
                return Promise.reject("Error occured");
            }
            else {
                return Promise.resolve(result.value);
            }
        });
    }
    exports.getReleaseDefinitions = getReleaseDefinitions;
    // Get the latest deployment of an environment
    function getLatestDeployment(context, projectname, releaseid, isOnPrem) {
        var url = "";
        if (isOnPrem) {
            url = getLatestDeploymentURLOnPrem(context.collection.uri, projectname, releaseid);
        }
        else {
            url = getLatestDeploymentURL(context.collection.name, projectname, releaseid);
        }
        return restApiCall(url).then(function (result) {
            if (!result || !result.value) {
                return Promise.reject("Error occured");
            }
            else {
                return Promise.resolve(result.value);
            }
        });
    }
    exports.getLatestDeployment = getLatestDeployment;
    // Get the latest release information tied to a project/release definition/environment
    function getLatestRelease(context, projectname, releaseid, environmentid, isOnPrem) {
        var url = "";
        if (isOnPrem) {
            url = getLatestReleaseURLOnPrem(context.collection.uri, projectname, releaseid, environmentid);
        }
        else {
            url = getLatestReleaseURL(context.collection.name, projectname, releaseid, environmentid);
        }
        return restApiCall(url).then(function (result) {
            if (!result || !result.value) {
                return Promise.reject("Error occured");
            }
            else {
                return Promise.resolve(result.value);
            }
        });
    }
    exports.getLatestRelease = getLatestRelease;
    // Get latest release tied to a project/release definition/environment 
    function getLatestReleaseEnvironment(context, projectname, releaseid, environmentid, isOnPrem) {
        var url = "";
        if (isOnPrem) {
            url = getLatestReleaseEnvironmentURLOnPrem(context.collection.uri, projectname, releaseid, environmentid);
        }
        else {
            url = getLatestReleaseEnvironmentURL(context.collection.name, projectname, releaseid, environmentid);
        }
        return restApiCall(url).then(function (result) {
            if (!result) {
                return Promise.reject("Error occured");
            }
            else {
                var arr = [];
                arr.push(result);
                return Promise.resolve(arr);
            }
        });
    }
    exports.getLatestReleaseEnvironment = getLatestReleaseEnvironment;
    // Get list of release environments tied to a particular release definition
    function getReleaseEnvironments(context, projectname, releaseid, isOnPrem) {
        var url = "";
        if (isOnPrem) {
            url = getReleaseEnvironmentsUrlOnPrem(context.collection.uri, projectname, releaseid);
        }
        else {
            url = getReleaseEnvironmentsUrl(context.collection.name, projectname, releaseid);
        }
        return restApiCall(url).then(function (result) {
            if (!result || !result.environments) {
                return Promise.reject("Error occured");
            }
            else {
                return Promise.resolve(result.environments);
            }
        });
    }
    exports.getReleaseEnvironments = getReleaseEnvironments;
    //	**********************
    //	Rest Api Url Endpoints API
    //	**********************
    //	Azure DevOps
    function getReleaseDefinitionsUrl(collectionname, projectname) {
        return "https://vsrm.dev.azure.com/" + collectionname + "/" + projectname + "/_apis/Release/definitions";
    }
    exports.getReleaseDefinitionsUrl = getReleaseDefinitionsUrl;
    function getReleaseEnvironmentsUrl(collectionname, projectname, releaseid) {
        return "https://vsrm.dev.azure.com/" + collectionname + "/" + projectname + "/_apis/release/definitions/" + releaseid;
    }
    exports.getReleaseEnvironmentsUrl = getReleaseEnvironmentsUrl;
    function getProjectsUrl(collectionname) {
        return "https://dev.azure.com/" + collectionname + "/_apis/projects";
    }
    exports.getProjectsUrl = getProjectsUrl;
    function getLatestDeploymentURL(collectionname, projectname, releaseid) {
        return "https://vsrm.dev.azure.com/" + collectionname + "/" + projectname + "/_apis/release/deployments?definitionId=" + releaseid + "&$top=1"; //default order is descending
    }
    exports.getLatestDeploymentURL = getLatestDeploymentURL;
    function getLatestReleaseURL(collectionname, projectname, releaseid, environmentid) {
        return "https://vsrm.dev.azure.com/" + collectionname + "/" + projectname + "/_apis/release/deployments?definitionId=" + releaseid + "&$top=1&definitionEnvironmentId=" + environmentid + "&queryorder=descending";
    }
    exports.getLatestReleaseURL = getLatestReleaseURL;
    function getLatestReleaseEnvironmentURL(collectionname, projectname, releaseid, environmentid) {
        return "https://vsrm.dev.azure.com/" + collectionname + "/" + projectname + "/_apis/release/releases/" + releaseid + "/environments/" + environmentid;
    }
    exports.getLatestReleaseEnvironmentURL = getLatestReleaseEnvironmentURL;
    function createLogUrl(collectionname, projectname, releaseid, environmentid) {
        return "https://" + collectionname + ".visualstudio.com/" + projectname + "/_releaseProgress?_a=release-environment-logs&releaseId=" + releaseid + "&environmentId=" + environmentid;
    }
    exports.createLogUrl = createLogUrl;
    //
    // On Prem
    function getReleaseDefinitionsUrlOnPrem(collectionUri, projectname) {
        return "" + collectionUri + projectname + "/_apis/Release/definitions";
    }
    exports.getReleaseDefinitionsUrlOnPrem = getReleaseDefinitionsUrlOnPrem;
    function getReleaseEnvironmentsUrlOnPrem(collectionUri, projectname, releaseid) {
        return "" + collectionUri + projectname + "/_apis/release/definitions/" + releaseid;
    }
    exports.getReleaseEnvironmentsUrlOnPrem = getReleaseEnvironmentsUrlOnPrem;
    function getProjectsUrlOnPrem(collectionUri) {
        return collectionUri + "_apis/projects";
    }
    exports.getProjectsUrlOnPrem = getProjectsUrlOnPrem;
    function getLatestDeploymentURLOnPrem(collectionUri, projectname, releaseid) {
        return "" + collectionUri + projectname + "/_apis/release/deployments?definitionId=" + releaseid + "&$top=1"; //default order is descending
    }
    exports.getLatestDeploymentURLOnPrem = getLatestDeploymentURLOnPrem;
    function getLatestReleaseURLOnPrem(collectionUri, projectname, releaseid, environmentid) {
        return "" + collectionUri + projectname + "/_apis/release/deployments?definitionId=" + releaseid + "&$top=1&definitionEnvironmentId=" + environmentid + "&queryorder=descending";
    }
    exports.getLatestReleaseURLOnPrem = getLatestReleaseURLOnPrem;
    function getLatestReleaseEnvironmentURLOnPrem(collectionUri, projectname, releaseid, environmentid) {
        return "" + collectionUri + projectname + "/_apis/release/releases/" + releaseid + "/environments/" + environmentid;
    }
    exports.getLatestReleaseEnvironmentURLOnPrem = getLatestReleaseEnvironmentURLOnPrem;
    function createLogUrlOnPrem(collectionUri, projectname, releaseid, environmentid) {
        return "" + collectionUri + projectname + "/_releaseProgress?_a=release-environment-logs&releaseId=" + releaseid + "&environmentId=" + environmentid;
    }
    exports.createLogUrlOnPrem = createLogUrlOnPrem;
    function createLogUrlOnPremForTFS2018U1AndBelow(collectionUri, projectname, releaseid, releasedefinitionid) {
        return "" + collectionUri + projectname + "/_apps/hub/ms.vss-releaseManagement-web.hub-explorer?releaseId=" + releaseid + "&definitionId=" + releasedefinitionid + "&_a=release-logs";
        //return `${collectionUri}${projectname}/_apps/hub/ms.vss-releaseManagement-web.hub-explorer?releaseId=${releaseid}&definitionId=${releasedefinitionid}&_a=release-summary`;
    }
    exports.createLogUrlOnPremForTFS2018U1AndBelow = createLogUrlOnPremForTFS2018U1AndBelow;
});
//	**********************
//	**********************
//# sourceMappingURL=RestCall.js.map