
export interface WidgetSettings { }

export interface ReleaseWidgetSettings extends WidgetSettings {
    projectName: string;
	projectId: number;
	releaseDefinitionName: string;
    releaseDefinitionId: string;
	releaseEnvironmentName: string;
    releaseEnvironmentId: string;
	colorShowChecked: boolean;
}

/**
 * Determines if the settings are valid to save.
 */
export function areSettingsValid(widgetSettings: ReleaseWidgetSettings): boolean {
    return (widgetSettings.projectName != null &&
        widgetSettings.releaseDefinitionId != null &&
        widgetSettings.releaseEnvironmentId != null
    );
}


export class WidgetSettingsHelper<T extends WidgetSettings> {
    public static Serialize<T>(widgetSettings: T): string {
        return JSON.stringify(widgetSettings);
    }

    public static Parse<T>(settingsString: string): T {
        let settings = JSON.parse(settingsString);
        if (!settings) {
            settings = {};
        }
        return settings;
    }
}