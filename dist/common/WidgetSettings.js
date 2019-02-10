define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Determines if the settings are valid to save.
     */
    function areSettingsValid(widgetSettings) {
        return (widgetSettings.projectName != null &&
            widgetSettings.releaseDefinitionId != null &&
            widgetSettings.releaseEnvironmentId != null);
    }
    exports.areSettingsValid = areSettingsValid;
    var WidgetSettingsHelper = /** @class */ (function () {
        function WidgetSettingsHelper() {
        }
        WidgetSettingsHelper.Serialize = function (widgetSettings) {
            return JSON.stringify(widgetSettings);
        };
        WidgetSettingsHelper.Parse = function (settingsString) {
            var settings = JSON.parse(settingsString);
            if (!settings) {
                settings = {};
            }
            return settings;
        };
        return WidgetSettingsHelper;
    }());
    exports.WidgetSettingsHelper = WidgetSettingsHelper;
});
//# sourceMappingURL=WidgetSettings.js.map