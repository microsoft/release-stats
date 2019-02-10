/// <reference types="vss-web-extension-sdk" />
define(["require", "exports", "TFS/Dashboards/WidgetHelpers", "../common/WidgetSettings", "../common/RestCall"], function (require, exports, WidgetHelpers, WidgetSettings_1, RestCall_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WidgetConfiguration = /** @class */ (function () {
        function WidgetConfiguration() {
            var _this = this;
            this.projectSelector = $("#project-selection");
            this.releaseDefinitionSelector = $("#release-definition-selection");
            this.releaseEnvironmentSelector = $("#release-environment-selection");
            this.colorShowCheckbox = $("#colorcheckbox");
            this.context = VSS.getWebContext();
            this.isOnPrem = false;
            this.projectChanged = function () {
                var projectName = $("#project-selection option:selected").text();
                _this.settings.projectName = $("#project-selection option:selected").text();
                _this.settings.projectId = $("#project-selection option:selected").val();
                _this.updateReleases(_this.settings.projectName);
            };
            this.releaseDefinitionChanged = function () {
                var releaseId = $("#release-definition-selection option:selected").val();
                //var releaseName = $("#release-definition-selection option:selected").text();
                _this.settings.releaseDefinitionId = releaseId.toString();
                _this.settings.releaseDefinitionName = $("#release-definition-selection option:selected").text();
                _this.updateReleaseEnvironments(releaseId);
            };
            this.releaseEnvironmentChanged = function () {
                //var environmentId = $("#release-environment-selection option:selected").val();
                //var environmentName = $("#release-environment-selection option:selected").text();
                _this.settings.releaseEnvironmentId = $("#release-environment-selection option:selected").val().toString();
                _this.settings.releaseEnvironmentName = $("#release-environment-selection option:selected").text();
                _this.onChange(_this.settings);
            };
            this.checkboxClicked = function () {
                _this.settings.colorShowChecked = _this.colorShowCheckbox.is(':checked');
                _this.onChange(_this.settings);
            };
        }
        WidgetConfiguration.prototype.load = function (widgetSettings, widgetConfigurationContext) {
            var _this = this;
            this.widgetConfigurationContext = widgetConfigurationContext;
            this.settings = WidgetSettings_1.WidgetSettingsHelper.Parse(widgetSettings.customSettings.data);
            //check to see if on prem
            //if (this.context.collection.uri.includes(".visualstudio.com") || this.context.collection.uri.includes("dev.azure.com")) {
            if (this.context.account.name.includes("Team Foundation Server")) {
                this.isOnPrem = true;
            }
            else {
                this.isOnPrem = false;
            }
            // Dropdown change functions
            this.projectSelector.change(this.projectChanged);
            this.releaseDefinitionSelector.change(this.releaseDefinitionChanged);
            this.releaseEnvironmentSelector.change(this.releaseEnvironmentChanged);
            this.colorShowCheckbox.change(this.checkboxClicked);
            //Initially get list of projects, release definitions, environments, and set saved settings
            RestCall_1.getProjects(this.context, this.isOnPrem).then(function (projects) {
                var optionsToInsert = projects
                    .map(function (r) { return _this.createOptionsHtml(r); })
                    .join("");
                _this.projectSelector.append(optionsToInsert);
                var setToSavedSetting = projects.some(function (e) { return e.id === _this.settings.projectId; });
                if (setToSavedSetting) {
                    var savedvalue = projects.find(function (e) { return e.id === _this.settings.projectId; });
                    _this.projectSelector.val(savedvalue.id);
                }
                else {
                    _this.settings.projectName = $("#project-selection option:selected").text();
                    _this.settings.projectId = $("#project-selection option:selected").val();
                }
                var projectName = $("#project-selection option:selected").text();
                RestCall_1.getReleaseDefinitions(_this.context, projectName, _this.isOnPrem).then(function (releaseDefinitions) {
                    var optionsToInsert = releaseDefinitions
                        .map(function (r) { return _this.createOptionsHtml(r); })
                        .join("");
                    _this.releaseDefinitionSelector.append(optionsToInsert);
                    var setToSavedSetting1 = releaseDefinitions.some(function (e) { return e.id == _this.settings.releaseDefinitionId; });
                    if (setToSavedSetting1) {
                        var savedvalue = releaseDefinitions.find(function (e) { return e.id == _this.settings.releaseDefinitionId; });
                        _this.releaseDefinitionSelector.val(savedvalue.id);
                    }
                    else {
                        _this.settings.releaseDefinitionId = $("#release-definition-selection option:selected").val().toString();
                        _this.settings.releaseDefinitionName = $("#release-definition-selection option:selected").text();
                    }
                    var releaseDefinitionId = _this.releaseDefinitionSelector.val();
                    RestCall_1.getReleaseEnvironments(_this.context, projectName, releaseDefinitionId, _this.isOnPrem).then(function (releaseEnvironments) {
                        var optionsToInsert = releaseEnvironments
                            .map(function (r) { return _this.createOptionsHtml(r); })
                            .join("");
                        _this.releaseEnvironmentSelector.append(optionsToInsert);
                        var setToSavedSetting2 = releaseEnvironments.some(function (e) { return e.id == _this.settings.releaseEnvironmentId; });
                        if (setToSavedSetting2) {
                            var savedvalue = releaseEnvironments.find(function (e) { return e.id == _this.settings.releaseEnvironmentId; });
                            _this.releaseEnvironmentSelector.val(savedvalue.id);
                        }
                        else {
                            _this.settings.releaseEnvironmentId = $("#release-environment-selection option:selected").val().toString();
                            _this.settings.releaseEnvironmentName = $("#release-environment-selection option:selected").text();
                            _this.onChange(_this.settings);
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
        };
        // Handles config contract requests to validate the state of the configuration.
        WidgetConfiguration.prototype.onSave = function () {
            return WidgetHelpers.WidgetConfigurationSave.Valid(this.getCustomSettings());
        };
        // Handles Config contract requests for configuration.
        WidgetConfiguration.prototype.getCustomSettings = function () {
            return {
                data: WidgetSettings_1.WidgetSettingsHelper.Serialize(this.settings)
            };
        };
        // Responsible for packaging up current state for notification to the config context.
        WidgetConfiguration.prototype.onChange = function (settings) {
            //Notify parent of config resize, if the # of custom fields has changed
            if (this.settings) {
                VSS.resize();
            }
            this.settings = settings;
            //If Settings are valid, notify the widget to repaint.        
            if (WidgetSettings_1.areSettingsValid(this.settings)) {
                var eventName = WidgetHelpers.WidgetEvent.ConfigurationChange;
                var eventArgs = WidgetHelpers.WidgetEvent.Args(this.getCustomSettings());
                this.widgetConfigurationContext.notify(eventName, eventArgs);
            }
        };
        // Function to return marked up option html
        WidgetConfiguration.prototype.createOptionsHtml = function (value) {
            return "<option value=\"" + value.id + "\">" + value.name + "</option>";
        };
        // Update the list of options for the release definition dropdown
        WidgetConfiguration.prototype.updateReleases = function (projectName) {
            var _this = this;
            this.settings.projectName = projectName;
            RestCall_1.getReleaseDefinitions(this.context, projectName, this.isOnPrem).then(function (releaseDefinitions) {
                _this.releaseDefinitionSelector.empty();
                var optionsToInsert = releaseDefinitions
                    .map(function (r) { return _this.createOptionsHtml(r); })
                    .join("");
                _this.releaseDefinitionSelector.append(optionsToInsert);
                if ($("#release-definition-selection option:selected").val() == null) {
                    _this.settings.releaseDefinitionId = "";
                    _this.settings.releaseDefinitionName = "";
                }
                else {
                    _this.settings.releaseDefinitionId = $("#release-definition-selection option:selected").val().toString();
                    _this.settings.releaseDefinitionName = $("#release-definition-selection option:selected").text();
                }
                _this.updateReleaseEnvironments(_this.releaseDefinitionSelector.val());
            });
        };
        // Update the list of options for the release environment dropdown
        WidgetConfiguration.prototype.updateReleaseEnvironments = function (releaseId) {
            var _this = this;
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
                RestCall_1.getReleaseEnvironments(this.context, this.settings.projectName, releaseId, this.isOnPrem).then(function (releaseDefinitions) {
                    _this.releaseEnvironmentSelector.empty();
                    var optionsToInsert = releaseDefinitions
                        .map(function (r) { return _this.createOptionsHtml(r); })
                        .join("");
                    _this.releaseEnvironmentSelector.append(optionsToInsert);
                    _this.settings.releaseEnvironmentId = $("#release-environment-selection option:selected").val().toString();
                    _this.settings.releaseEnvironmentName = $("#release-environment-selection option:selected").text();
                    _this.onChange(_this.settings);
                });
            }
        };
        return WidgetConfiguration;
    }());
    VSS.register("ReleaseStats.Configuration", function () {
        var widgetConfiguration = new WidgetConfiguration();
        return widgetConfiguration;
    });
});
//# sourceMappingURL=WidgetConfiguration.js.map