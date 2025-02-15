import { doesNotThrow, throws } from "assert";
import { TempFile } from "@manuth/temp-files";
import { TextDocument, Uri, window } from "vscode";
import { MarkdownFileNotFoundException } from "../../../../MarkdownFileNotFoundException";
import { ISettings } from "../../../../Properties/ISettings";
import { Settings } from "../../../../Properties/Settings";
import { ConvertTask } from "../../../../System/Tasks/ConvertTask";
import { ITestContext } from "../../../ITestContext";
import { TestConstants } from "../../../TestConstants";

/**
 * Registers tests for the {@link ConvertTask `ConvertTask`} class.
 *
 * @param context
 * The test-context.
 */
export function ConvertTaskTests(context: ITestContext<ISettings>): void
{
    suite(
        nameof(ConvertTask),
        () =>
        {
            /**
             * Provides an implementation of the {@link ConvertTask `ConvertTask`} class for testing.
             */
            class TestConvertTask extends ConvertTask
            {
                /**
                 * @inheritdoc
                 *
                 * @returns
                 * The best matching markdown-document.
                 */
                public override GetMarkdownDocument(): TextDocument
                {
                    return super.GetMarkdownDocument();
                }
            }

            suite(
                nameof<TestConvertTask>((task) => task.GetMarkdownDocument),
                () =>
                {
                    let testFile: TempFile;
                    let task: TestConvertTask;

                    suiteSetup(
                        async () =>
                        {
                            testFile = new TempFile();
                            task = new TestConvertTask(TestConstants.Extension);
                        });

                    suiteTeardown(
                        async () =>
                        {
                            testFile.Dispose();
                        });

                    setup(
                        async () =>
                        {
                            await window.showTextDocument(Uri.file(testFile.FullName));
                            context.Settings.IgnoreLanguageMode = false;
                        });

                    test(
                        "Checking whether an exception is thrown if no markdown-file is opened…",
                        () =>
                        {
                            throws(() => task.GetMarkdownDocument(), MarkdownFileNotFoundException);
                        });

                    test(
                        `Checking whether no exception is thrown if \`${nameof<Settings>((s) => s.IgnoreLanguageMode)}\` is enabled…`,
                        async function()
                        {
                            context.Settings.IgnoreLanguageMode = true;
                            doesNotThrow(() => task.GetMarkdownDocument());
                        });
                });
        });
}
