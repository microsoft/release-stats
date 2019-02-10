/// <reference types="vss-web-extension-sdk" />
define(["require", "exports", "TFS/Dashboards/WidgetHelpers", "../common/WidgetSettings", "../common/RestCall"], function (require, exports, WidgetHelpers, WidgetSettings_1, RestCall_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Widget = /** @class */ (function () {
        function Widget() {
            this.isOnPrem = false;
        }
        Widget.prototype.load = function (widgetSettings) {
            return this.render(widgetSettings);
        };
        Widget.prototype.reload = function (widgetSettings) {
            return this.render(widgetSettings, true);
        };
        Widget.prototype.render = function (widgetSettings, suppressAnimation) {
            var _this = this;
            if (suppressAnimation === void 0) { suppressAnimation = false; }
            var settings = WidgetSettings_1.WidgetSettingsHelper.Parse(widgetSettings.customSettings.data);
            var context = VSS.getWebContext();
            var size = {
                width: widgetSettings.size.columnSpan * 160,
                height: widgetSettings.size.rowSpan * 160
            };
            document.getElementById("widgetcontainer").style.fontSize = "xx-small";
            if (widgetSettings.size.columnSpan > 1) {
                document.getElementById("widgetcontainer").style.fontSize = "x-small";
            }
            if (widgetSettings.size.rowSpan > 1) {
                document.getElementById("widgetcontainer").style.fontSize = "small";
            }
            //Clear previous values
            this.clearAll();
            //check to see if on prem
            // TO DO: dirty method that should be revised
            //if (context.collection.uri.includes(".visualstudio.com") || context.collection.uri.includes("dev.azure.com")) {
            if (context.account.name.includes("Team Foundation Server")) {
                this.isOnPrem = true;
            }
            else {
                this.isOnPrem = false;
            }
            if (settings.releaseDefinitionName != null) {
                document.getElementById("releasedefinitionname").innerHTML = settings.releaseDefinitionName;
            }
            if (settings.releaseEnvironmentName != null) {
                document.getElementById("environmentname").innerHTML = settings.releaseEnvironmentName;
            }
            // Check to see if we have project id within settings
            // if we do not then do not have any data
            if (settings.projectName != null && settings.projectName != "") {
                RestCall_1.getLatestRelease(context, settings.projectName, settings.releaseDefinitionId, settings.releaseEnvironmentId, this.isOnPrem).then(function (latestDeployment) {
                    var latestattemptid = "";
                    var deploymentenvironmentid = "";
                    var latestreleaseid = "";
                    if (Array.isArray(latestDeployment) && latestDeployment.length) {
                        document.getElementById("releasename").innerHTML = latestDeployment[0].release.name;
                        document.getElementById("deploymentstatus").innerHTML = latestDeployment[0].deploymentStatus;
                        document.getElementById("buildused").innerHTML = latestDeployment[0].release.artifacts[0].alias;
                        if (settings.colorShowChecked) {
                            if (latestDeployment[0].deploymentStatus == "succeeded") {
                                document.getElementById("widgetcontainer").style.borderColor = "green";
                            }
                            else if (latestDeployment[0].deploymentStatus == "failed") {
                                document.getElementById("widgetcontainer").style.borderColor = "coral";
                            }
                            else if (latestDeployment[0].deploymentStatus == "notDeployed") {
                                document.getElementById("widgetcontainer").style.borderColor = "yellow";
                            }
                            else {
                                document.getElementById("widgetcontainer").style.borderColor = "white";
                            }
                        }
                        //	TO DO: select a library and utilize it for date formatting
                        //	TO DO: for tfs 2018 rtm and u1, api does not have completedOn
                        //	so will need to calculate it
                        document.getElementById("starttime").innerHTML = _this.formatDate(latestDeployment[0].startedOn);
                        if (latestDeployment[0].completedOn != null) {
                            document.getElementById("endtime").innerHTML = _this.formatDate(latestDeployment[0].completedOn);
                            document.getElementById("timetaken").innerHTML = _this.timeDifference(latestDeployment[0].startedOn, latestDeployment[0].completedOn);
                        }
                        else {
                            document.getElementById("endtime").innerHTML = _this.formatDate(latestDeployment[0].lastModifiedOn);
                            document.getElementById("timetaken").innerHTML = _this.timeDifference(latestDeployment[0].startedOn, latestDeployment[0].lastModifiedOn);
                        }
                        latestattemptid = latestDeployment[0].attempt;
                        deploymentenvironmentid = latestDeployment[0].releaseEnvironment.id;
                        latestreleaseid = latestDeployment[0].release.id;
                    }
                    RestCall_1.getLatestReleaseEnvironment(context, settings.projectName, latestreleaseid, deploymentenvironmentid, _this.isOnPrem).then(function (latestDeploymentEnv) {
                        if (Array.isArray(latestDeploymentEnv) && latestDeploymentEnv.length) {
                            var containsError = latestDeploymentEnv[0].deploySteps.find(function (e) { return e.status == "failed" && e.attempt == latestattemptid; });
                            if (containsError != null) {
                                var releasePhaseError = containsError.releaseDeployPhases.find(function (e) { return e.status == "failed" || e.status == "canceled"; });
                                var deploymentJobError = releasePhaseError.deploymentJobs.find(function (e) { return e.job.status == "failed" || e.job.status == "canceled"; });
                                var taskError = deploymentJobError.tasks.find(function (e) { return e.status == "failed"; });
                                document.getElementById("errormessage").innerHTML = taskError.issues[0].message;
                                document.getElementById("errormessage").title = taskError.issues[0].message;
                                document.getElementById("errorcontainer").style.visibility = "visible";
                                // Set max height for error message so that url is visible
                                // (user can click on url to open a new tab to see full message)
                                // TO DO: dirty method that should be revised
                                var errormessageheight = size.height - 12 - document.getElementById("errorlabelcontainer").offsetTop;
                                if (document.getElementById("errorlabelcontainer").offsetHeight > errormessageheight) {
                                    document.getElementById("errorlabelcontainer").style.height = errormessageheight.toString() + "px";
                                    document.getElementById("errorlabelcontainer").style.overflow = "hidden";
                                }
                                var url = "";
                                if (_this.isOnPrem) {
                                    // TO DO: differentiate between tfs 2018 versions
                                    // Only TFS 2018U2 and greater can support new log location
                                    url = RestCall_1.createLogUrlOnPrem(context.collection.uri, settings.projectName, latestreleaseid, deploymentenvironmentid);
                                    //url = createLogUrlOnPremForTFS2018U1AndBelow(context.collection.uri, settings.projectName, latestreleaseid, settings.releaseDefinitionId);
                                }
                                else {
                                    url = RestCall_1.createLogUrl(context.collection.name, settings.projectName, latestreleaseid, deploymentenvironmentid);
                                }
                                document.getElementById("url").href = url;
                            }
                        }
                    });
                });
            }
            else {
                // TO DO : show a message to user to configure widget
            }
            return WidgetHelpers.WidgetStatusHelper.Success();
        };
        Widget.prototype.clearAll = function () {
            document.getElementById("releasedefinitionname").innerHTML = "";
            document.getElementById("environmentname").innerHTML = "";
            document.getElementById("releasename").innerHTML = '';
            document.getElementById("deploymentstatus").innerHTML = '';
            document.getElementById("buildused").innerHTML = '';
            document.getElementById("starttime").innerHTML = '';
            document.getElementById("endtime").innerHTML = '';
            document.getElementById("timetaken").innerHTML = '';
            document.getElementById("errormessage").innerHTML = '';
            document.getElementById("errormessage").title = '';
            document.getElementById("url").href = '';
            document.getElementById("errorcontainer").style.visibility = "hidden";
            document.getElementById("widgetcontainer").style.borderColor = "transparent";
        };
        Widget.prototype.formatDate = function (datestring) {
            var date = new Date(datestring);
            var day = date.getDate();
            var monthIndex = date.getMonth();
            var year = date.getFullYear();
            var minutes = date.getMinutes();
            var hours = date.getHours();
            var seconds = date.getSeconds();
            var daystring = day.toString();
            var monthstring = (monthIndex + 1).toString();
            var minutesstring = minutes.toString();
            var hoursstring = hours.toString();
            var secondsstring = seconds.toString();
            if (day < 10) {
                daystring = '0' + daystring;
            }
            if (monthIndex < 10) {
                monthstring = '0' + monthstring;
            }
            if (minutes < 10) {
                minutesstring = '0' + minutesstring;
            }
            if (hours < 10) {
                hoursstring = '0' + hoursstring;
            }
            if (seconds < 10) {
                secondsstring = '0' + secondsstring;
            }
            var myFormattedDate = monthstring + "-" + daystring + "-" + year + " " + hoursstring + ":" + minutesstring + ":" + secondsstring;
            return myFormattedDate;
        };
        Widget.prototype.timeDifference = function (datestringstart, datestringend) {
            var datestart = new Date(datestringstart).getTime();
            var dateend = new Date(datestringend).getTime();
            var diff = dateend - datestart;
            var days = Math.floor(diff / 1000 / 60 / 60 / 24);
            diff -= days * 1000 * 60 * 60 * 24;
            var hours = Math.floor(diff / 1000 / 60 / 60);
            diff -= hours * 1000 * 60 * 60;
            var hoursstring = hours.toString();
            if (hours < 10) {
                hoursstring = '0' + hoursstring;
            }
            var minutes = Math.floor(diff / 1000 / 60);
            diff -= minutes * 1000 * 60;
            var minutesstring = minutes.toString();
            if (minutes < 10) {
                minutesstring = '0' + minutesstring;
            }
            var seconds = Math.floor(diff / 1000);
            var secondsstring = seconds.toString();
            if (seconds < 10) {
                secondsstring = '0' + secondsstring;
            }
            var timediff = "";
            if (days < 1) {
                timediff = hoursstring + ":" + minutesstring + ":" + secondsstring;
            }
            else {
                timediff = days.toString() + "." + hoursstring + ":" + minutesstring + ":" + secondsstring;
            }
            return timediff;
        };
        return Widget;
    }());
    exports.Widget = Widget;
    WidgetHelpers.IncludeWidgetStyles();
    VSS.register("ReleaseStats.Widget", function () {
        return new Widget();
    });
});
//# sourceMappingURL=Widget.js.map