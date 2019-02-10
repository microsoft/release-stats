/// <reference types="vss-web-extension-sdk" />

import * as Q from 'q';

import WidgetHelpers = require('TFS/Dashboards/WidgetHelpers');
import WidgetContracts = require('TFS/Dashboards/WidgetContracts');

import { WidgetSettingsHelper, ReleaseWidgetSettings, areSettingsValid } from '../common/WidgetSettings';
import { getProjects, getReleaseDefinitions, getReleaseEnvironments } from "../common/RestCall";

class WidgetConfiguration {
    private widgetConfigurationContext: WidgetContracts.IWidgetConfigurationContext;
	private settings: ReleaseWidgetSettings;
	private projectSelector = $("#project-selection");
	private releaseDefinitionSelector = $("#release-definition-selection");
	private releaseEnvironmentSelector = $("#release-environment-selection");
	private colorShowCheckbox = $("#colorcheckbox");
	private context = VSS.getWebContext();
	private isOnPrem = false;


    public load(widgetSettings: WidgetContracts.WidgetSettings, widgetConfigurationContext: WidgetContracts.IWidgetConfigurationContext): IPromise<WidgetContracts.WidgetStatus> {

        this.widgetConfigurationContext = widgetConfigurationContext;
		this.settings = WidgetSettingsHelper.Parse<ReleaseWidgetSettings>(widgetSettings.customSettings.data);

		//check to see if on prem
		//if (this.context.collection.uri.includes(".visualstudio.com") || this.context.collection.uri.includes("dev.azure.com")) {
		if (this.context.account.name.includes("Team Foundation Server")) {
			this.isOnPrem = true;
		} else {
			this.isOnPrem = false;
		}

		// Dropdown change functions
		this.projectSelector.change(this.projectChanged);
		this.releaseDefinitionSelector.change(this.releaseDefinitionChanged);
		this.releaseEnvironmentSelector.change(this.releaseEnvironmentChanged);
		this.colorShowCheckbox.change(this.checkboxClicked);

		//Initially get list of projects, release definitions, environments, and set saved settings
		getProjects(this.context, this.isOnPrem).then(projects => {

			let optionsToInsert = projects
				.map(r => this.createOptionsHtml(r))
				.join("");

			this.projectSelector.append(optionsToInsert);

			let setToSavedSetting = projects.some(e => e.id === this.settings.projectId);
			if (setToSavedSetting) {
				let savedvalue = projects.find(e => e.id === this.settings.projectId);
				this.projectSelector.val(savedvalue.id);
			}
			else {
				this.settings.projectName = $("#project-selection option:selected").text();
				this.settings.projectId = $("#project-selection option:selected").val() as number;
			}

			let projectName = $("#project-selection option:selected").text();
			getReleaseDefinitions(this.context, projectName, this.isOnPrem).then(releaseDefinitions => {

				let optionsToInsert = releaseDefinitions
					.map(r => this.createOptionsHtml(r))
					.join("");

				this.releaseDefinitionSelector.append(optionsToInsert);

				let setToSavedSetting1 = releaseDefinitions.some(e => e.id == this.settings.releaseDefinitionId);
				if (setToSavedSetting1) {
					let savedvalue = releaseDefinitions.find(e => e.id == this.settings.releaseDefinitionId);
					this.releaseDefinitionSelector.val(savedvalue.id);
				}
				else {
					this.settings.releaseDefinitionId = $("#release-definition-selection option:selected").val().toString();
					this.settings.releaseDefinitionName = $("#release-definition-selection option:selected").text();
				}

				let releaseDefinitionId = this.releaseDefinitionSelector.val();
				getReleaseEnvironments(this.context, projectName, releaseDefinitionId, this.isOnPrem).then(releaseEnvironments => {

					let optionsToInsert = releaseEnvironments
						.map(r => this.createOptionsHtml(r))
						.join("");

					this.releaseEnvironmentSelector.append(optionsToInsert);

					let setToSavedSetting2 = releaseEnvironments.some(e => e.id == this.settings.releaseEnvironmentId);
					if (setToSavedSetting2) {
						let savedvalue = releaseEnvironments.find(e => e.id == this.settings.releaseEnvironmentId);
						this.releaseEnvironmentSelector.val(savedvalue.id);
					}
					else {
						this.settings.releaseEnvironmentId = $("#release-environment-selection option:selected").val().toString();
						this.settings.releaseEnvironmentName = $("#release-environment-selection option:selected").text();
						this.onChange(this.settings);
					}
				});
			});
		  
		});

		//Set color show checkbox
		if (this.settings != null && this.settings.colorShowChecked != null) {
			document.getElementById('colorcheckbox').checked = this.settings.colorShowChecked;
		}

        //After all initial loading is done, signal to framework about sizing
        VSS.resize();
        return WidgetHelpers.WidgetStatusHelper.Success();
    }

	// Handles config contract requests to validate the state of the configuration.
    public onSave(): IPromise<WidgetContracts.SaveStatus> {
        return WidgetHelpers.WidgetConfigurationSave.Valid(this.getCustomSettings());
    }

	// Handles Config contract requests for configuration.
    public getCustomSettings(): WidgetContracts.CustomSettings {
        return {
            data: WidgetSettingsHelper.Serialize<ReleaseWidgetSettings>(this.settings)
        };
    }

    // Responsible for packaging up current state for notification to the config context.
    private onChange(settings: ReleaseWidgetSettings): void {
        //Notify parent of config resize, if the # of custom fields has changed
        if(this.settings){
            VSS.resize(); 
        }

        this.settings = settings;        

        //If Settings are valid, notify the widget to repaint.        
        if (areSettingsValid(this.settings)) {
            var eventName = WidgetHelpers.WidgetEvent.ConfigurationChange;
            var eventArgs = WidgetHelpers.WidgetEvent.Args(this.getCustomSettings());
            this.widgetConfigurationContext.notify(eventName, eventArgs);            
        }
    }

	private projectChanged = () => {
			var projectName = $("#project-selection option:selected").text();
			this.settings.projectName = $("#project-selection option:selected").text();
			this.settings.projectId = $("#project-selection option:selected").val() as number;
			this.updateReleases(this.settings.projectName);
	};

	private releaseDefinitionChanged = () => {
			var releaseId = $("#release-definition-selection option:selected").val();
			//var releaseName = $("#release-definition-selection option:selected").text();
			this.settings.releaseDefinitionId = releaseId.toString();
			this.settings.releaseDefinitionName = $("#release-definition-selection option:selected").text();
			this.updateReleaseEnvironments(releaseId);
	};

	private releaseEnvironmentChanged = () => {
			//var environmentId = $("#release-environment-selection option:selected").val();
			//var environmentName = $("#release-environment-selection option:selected").text();
			this.settings.releaseEnvironmentId = $("#release-environment-selection option:selected").val().toString();
			this.settings.releaseEnvironmentName = $("#release-environment-selection option:selected").text();
			this.onChange(this.settings);
	};

	private checkboxClicked = () => {
			this.settings.colorShowChecked = this.colorShowCheckbox.is(':checked');
			this.onChange(this.settings);
	};

	// Function to return marked up option html
	private createOptionsHtml(value): string {
		return `<option value="${value.id}">${value.name}</option>`;
    }

	// Update the list of options for the release definition dropdown
	private updateReleases(projectName): void {
		this.settings.projectName = projectName;
        getReleaseDefinitions(this.context, projectName, this.isOnPrem).then(releaseDefinitions => {

			this.releaseDefinitionSelector.empty();

			let optionsToInsert = releaseDefinitions
				.map(r => this.createOptionsHtml(r))
				.join("");

			this.releaseDefinitionSelector.append(optionsToInsert);
			if ($("#release-definition-selection option:selected").val() == null) {
				this.settings.releaseDefinitionId = "";
				this.settings.releaseDefinitionName = "";
			}
			else {
				this.settings.releaseDefinitionId = $("#release-definition-selection option:selected").val().toString();
				this.settings.releaseDefinitionName = $("#release-definition-selection option:selected").text();
			}
			

			this.updateReleaseEnvironments(this.releaseDefinitionSelector.val());
		});
    }

	// Update the list of options for the release environment dropdown
	private updateReleaseEnvironments(releaseId): void {

		if (releaseId == null) {
			this.settings.releaseDefinitionId = "";
			this.settings.releaseDefinitionName = "";
			this.releaseEnvironmentSelector.empty();

			this.settings.releaseEnvironmentId = "";
			this.settings.releaseEnvironmentName = "";
			this.onChange(this.settings);
		} 
		else {
			this.settings.releaseDefinitionId = releaseId;
			getReleaseEnvironments(this.context, this.settings.projectName, releaseId, this.isOnPrem).then(releaseDefinitions => {
				this.releaseEnvironmentSelector.empty();

				let optionsToInsert = releaseDefinitions
					.map(r => this.createOptionsHtml(r))
					.join("");

				this.releaseEnvironmentSelector.append(optionsToInsert);
				this.settings.releaseEnvironmentId = $("#release-environment-selection option:selected").val().toString();
				this.settings.releaseEnvironmentName = $("#release-environment-selection option:selected").text();
				this.onChange(this.settings);
			});
		}
    }
}

VSS.register("ReleaseStats.Configuration", function () {
    let widgetConfiguration = new WidgetConfiguration();
    return widgetConfiguration;
});