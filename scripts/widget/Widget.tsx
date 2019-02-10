/// <reference types="vss-web-extension-sdk" />

import * as Q from 'q';

import WidgetHelpers = require('TFS/Dashboards/WidgetHelpers');
import WidgetContracts = require('TFS/Dashboards/WidgetContracts');

import { WidgetSettingsHelper, ReleaseWidgetSettings } from '../common/WidgetSettings';
import { getLatestRelease, getLatestReleaseEnvironment, createLogUrl, createLogUrlOnPrem, createLogUrlOnPremForTFS2018U1AndBelow } from "../common/RestCall";

export class Widget {

	private isOnPrem = false;

    public load(widgetSettings: WidgetContracts.WidgetSettings) {
        return this.render(widgetSettings);
    }

    public reload(widgetSettings: WidgetContracts.WidgetSettings) {

        return this.render(widgetSettings, true);
    }

    private render(widgetSettings: WidgetContracts.WidgetSettings, suppressAnimation:boolean= false): IPromise<WidgetContracts.WidgetStatus> {

		let settings = WidgetSettingsHelper.Parse<ReleaseWidgetSettings>(widgetSettings.customSettings.data);
		let context = VSS.getWebContext();
		let size = {
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
		} else {
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
			getLatestRelease(context, settings.projectName, settings.releaseDefinitionId, settings.releaseEnvironmentId, this.isOnPrem).then(latestDeployment => {
			
				let latestattemptid = "";
				let deploymentenvironmentid = "";
				let latestreleaseid = "";

				if (Array.isArray(latestDeployment) && latestDeployment.length) {
					document.getElementById("releasename").innerHTML = latestDeployment[0].release.name;
					document.getElementById("deploymentstatus").innerHTML = latestDeployment[0].deploymentStatus;
					document.getElementById("buildused").innerHTML = latestDeployment[0].release.artifacts[0].alias;

					if (settings.colorShowChecked) {
						if (latestDeployment[0].deploymentStatus == "succeeded") {
							document.getElementById("widgetcontainer").style.borderColor = "green";
						} else if (latestDeployment[0].deploymentStatus == "failed") {
							document.getElementById("widgetcontainer").style.borderColor = "coral";
						} else if (latestDeployment[0].deploymentStatus == "notDeployed") {
							document.getElementById("widgetcontainer").style.borderColor = "yellow";
						} else {
							document.getElementById("widgetcontainer").style.borderColor = "white";
						}
					}

					//	TO DO: select a library and utilize it for date formatting
					//	TO DO: for tfs 2018 rtm and u1, api does not have completedOn
					//	so will need to calculate it
					document.getElementById("starttime").innerHTML = this.formatDate(latestDeployment[0].startedOn);
					if (latestDeployment[0].completedOn != null) {
						document.getElementById("endtime").innerHTML = this.formatDate(latestDeployment[0].completedOn);
						document.getElementById("timetaken").innerHTML = this.timeDifference(latestDeployment[0].startedOn, latestDeployment[0].completedOn);
					} else {
						document.getElementById("endtime").innerHTML = this.formatDate(latestDeployment[0].lastModifiedOn);
						document.getElementById("timetaken").innerHTML = this.timeDifference(latestDeployment[0].startedOn, latestDeployment[0].lastModifiedOn);
					}
					
					
					latestattemptid = latestDeployment[0].attempt;
					deploymentenvironmentid = latestDeployment[0].releaseEnvironment.id;
					latestreleaseid = latestDeployment[0].release.id;
				}

				getLatestReleaseEnvironment(context, settings.projectName, latestreleaseid, deploymentenvironmentid, this.isOnPrem).then(latestDeploymentEnv => {
			
					if (Array.isArray(latestDeploymentEnv) && latestDeploymentEnv.length) {

						let containsError = latestDeploymentEnv[0].deploySteps.find(e => e.status == "failed" && e.attempt == latestattemptid);
						if (containsError != null) {
							let releasePhaseError = containsError.releaseDeployPhases.find(e => e.status == "failed" || e.status == "canceled");
							let deploymentJobError = releasePhaseError.deploymentJobs.find(e => e.job.status == "failed" || e.job.status == "canceled");
							let taskError = deploymentJobError.tasks.find(e => e.status == "failed");
							document.getElementById("errormessage").innerHTML = taskError.issues[0].message;
							document.getElementById("errormessage").title = taskError.issues[0].message;
							document.getElementById("errorcontainer").style.visibility = "visible";
						
							// Set max height for error message so that url is visible
							// (user can click on url to open a new tab to see full message)
							// TO DO: dirty method that should be revised
							let errormessageheight = size.height - 12 - document.getElementById("errorlabelcontainer").offsetTop;
							if (document.getElementById("errorlabelcontainer").offsetHeight > errormessageheight) {
								document.getElementById("errorlabelcontainer").style.height = errormessageheight.toString() + "px";
								document.getElementById("errorlabelcontainer").style.overflow = "hidden";
							}

							var url = "";
							if (this.isOnPrem) {
								// TO DO: differentiate between tfs 2018 versions
								// Only TFS 2018U2 and greater can support new log location
								url = createLogUrlOnPrem(context.collection.uri, settings.projectName, latestreleaseid, deploymentenvironmentid);
								//url = createLogUrlOnPremForTFS2018U1AndBelow(context.collection.uri, settings.projectName, latestreleaseid, settings.releaseDefinitionId);
							} else {
								url = createLogUrl(context.collection.name, settings.projectName, latestreleaseid, deploymentenvironmentid);
							}
							(document.getElementById("url") as HTMLAnchorElement).href = url;
						}
					}
				});
			});
		} else {
			// TO DO : show a message to user to configure widget
		}

        return WidgetHelpers.WidgetStatusHelper.Success();
    }

	private clearAll() : void {
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
		(document.getElementById("url") as HTMLAnchorElement).href = '';
		document.getElementById("errorcontainer").style.visibility = "hidden";
		document.getElementById("widgetcontainer").style.borderColor = "transparent";
	}

	private formatDate(datestring: string) : string {
		var date = new Date(datestring);
		var day = date.getDate();
		var monthIndex = date.getMonth();
		var year = date.getFullYear();
		var minutes = date.getMinutes();
		var hours = date.getHours();
		var seconds = date.getSeconds();
				
		var daystring = day.toString();
		var monthstring = (monthIndex+1).toString();
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
		var myFormattedDate = monthstring+"-"+daystring+"-"+year+" "+ hoursstring+":"+minutesstring+":"+secondsstring;
		return myFormattedDate;
	}

	private timeDifference(datestringstart: string, datestringend: string) : string {
		var datestart = new Date(datestringstart).getTime();
		var dateend = new Date(datestringend).getTime();
		var diff = dateend - datestart;

		var days = Math.floor(diff / 1000 / 60 / 60 / 24);		
		diff -= days * 1000 * 60 * 60 *24;

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
		
		let timediff = "";
		if (days < 1) {
			timediff = hoursstring+":"+minutesstring+":"+secondsstring;
		} else {
			timediff = days.toString()+"."+hoursstring+":"+minutesstring+":"+secondsstring;
		}

		return timediff;
	}
}

WidgetHelpers.IncludeWidgetStyles();
VSS.register("ReleaseStats.Widget", function () {
    return new Widget();
});
