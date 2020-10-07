import { deepStrictEqual, ok, strictEqual } from "assert";
import { ConfigurationTarget, workspace, WorkspaceConfiguration } from "vscode";
import { ConversionType } from "../../Conversion/ConversionType";
import { ISettings } from "../../Properties/ISettings";
import { Settings } from "../../Properties/Settings";
import { ConfigInterceptor } from "../ConfigInterceptor";

suite(
    "ConfigInterceptor",
    () =>
    {
        let config: WorkspaceConfiguration;
        let key: keyof ISettings;
        let interceptor: TestConfigInterceptor;
        let originalSetting: Array<keyof typeof ConversionType>;
        let interceptedSetting: Array<keyof typeof ConversionType>;

        /**
         * Provides an implementation of the `ConfigInterceptor` class.
         */
        class TestConfigInterceptor extends ConfigInterceptor
        {
            /**
             * @inheritdoc
             */
            public Setup(): void
            {
                super.Setup();
            }

            /**
             * @inheritdoc
             */
            public Dispose(): void
            {
                super.Dispose();
            }
        }

        suiteSetup(
            async function()
            {
                config = workspace.getConfiguration(Settings.ConfigKey, workspace.workspaceFolders[0].uri);
                key = "ConversionType";
                originalSetting = [ConversionType[ConversionType.JPEG]] as any;
                interceptedSetting = [ConversionType[ConversionType.HTML]] as any;
                await config.update(key, originalSetting, ConfigurationTarget.Workspace);
                interceptor = new TestConfigInterceptor();
                interceptor.Setup();
            });

        suiteTeardown(
            () =>
            {
                interceptor.Dispose();
            });

        setup(
            () =>
            {
                interceptor.Settings = {
                    [key]: interceptedSetting
                };
            });

        test(
            "Checking whether original settings are resolved correctly…",
            () =>
            {
                interceptor.Settings = {};
                ok(key in workspace.getConfiguration(Settings.ConfigKey));

                deepStrictEqual(
                    workspace.getConfiguration(Settings.ConfigKey).get(key),
                    originalSetting);
            });

        test(
            "Checking whether settings can be intercepted dynamically…",
            () =>
            {
                deepStrictEqual(
                    workspace.getConfiguration(Settings.ConfigKey).get(key),
                    interceptedSetting);

                delete interceptor.Settings[key];

                deepStrictEqual(
                    workspace.getConfiguration(Settings.ConfigKey).get(key),
                    originalSetting);
            });

        test(
            "Checking whether absence of a section can be simulated…",
            () =>
            {
                (interceptor.Settings as any)[key] = undefined;
                ok(!workspace.getConfiguration(Settings.ConfigKey).has(key));
                ok(!(key in workspace.getConfiguration(Settings.ConfigKey)))
                delete interceptor.Settings[key];
                ok(workspace.getConfiguration(Settings.ConfigKey).has(key));
            });

        test(
            "Checking whether variable-inception is intercepted, too…",
            async () =>
            {
                let result = workspace.getConfiguration(Settings.ConfigKey).inspect(key);
                deepStrictEqual(result.defaultLanguageValue, result.defaultValue);
                deepStrictEqual(result.defaultValue, result.globalLanguageValue);
                deepStrictEqual(result.globalLanguageValue, result.globalValue);
                deepStrictEqual(result.globalValue, result.workspaceFolderLanguageValue);
                deepStrictEqual(result.workspaceFolderLanguageValue, result.workspaceFolderValue);
                deepStrictEqual(result.workspaceFolderValue, result.workspaceLanguageValue);
                deepStrictEqual(result.workspaceLanguageValue, result.workspaceValue);
                deepStrictEqual(result.workspaceValue, interceptedSetting);
            });

        test(
            "Checking whether configurations can be read from the configuration-object directly…",
            () =>
            {
                let markdownConfig = workspace.getConfiguration(Settings.ConfigKey);
                ok(key in markdownConfig);
                strictEqual(markdownConfig[key], interceptedSetting);
            });
    });
