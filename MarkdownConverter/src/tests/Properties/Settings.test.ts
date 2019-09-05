import Assert = require("assert");
import { env } from "vscode";
import { ConversionType } from "../../Conversion/ConversionType";
import { CustomPaperFormat } from "../../System/Documents/CustomPaperFormat";
import { EmojiType } from "../../System/Documents/EmojiType";
import { ListType } from "../../System/Documents/ListType";
import { Margin } from "../../System/Documents/Margin";
import { PaperOrientation } from "../../System/Documents/PaperOrientation";
import { StandardizedFormatType } from "../../System/Documents/StandardizedFormatType";
import { StandardizedPaperFormat } from "../../System/Documents/StandardizedPaperFormat";
import { TestSettings } from "./TestSettings";

suite(
    "Settings",
    () =>
    {
        let settings: TestSettings;

        setup(
            () =>
            {
                settings = new TestSettings();
                settings.Resource.Resource = {};
            });

        suite(
            "ConversionType",
            () =>
            {
                test(
                    "Checking whether the default conversion-type is set correctly…",
                    () =>
                    {
                        Assert.deepEqual(settings.ConversionType, [ConversionType.PDF]);
                    });

                test(
                    "Checking whether the conversion-types are resolved correctly…",
                    () =>
                    {
                        settings.Resource.Resource["ConversionType"] = ["HTML"] as Array<(keyof typeof ConversionType)>;
                        Assert.strictEqual(settings.ConversionType[0], ConversionType.HTML);
                    });
            });

        suite(
            "Locale",
            () =>
            {
                test(
                    "Checking whether the locale-setting is loaded correctly…",
                    () =>
                    {
                        settings.Resource.Resource["Locale"] = "de";
                        Assert.strictEqual(settings.Locale, "de");
                    });

                test(
                    "Checking whether the locale defaults to the locale of vscode…",
                    () =>
                    {
                        Assert.strictEqual(settings.Locale, env.language);
                    });
            });

        suite(
            "EmojiType",
            () =>
            {
                test(
                    "Checking whether the emoji-type is resolved correctly…",
                    () =>
                    {
                        settings.Resource.Resource["Parser.EmojiType"] = "Native" as keyof typeof EmojiType;
                        Assert.strictEqual(settings.EmojiType, EmojiType.Native);
                    });
            });

        suite(
            "PaperFormat",
            () =>
            {
                let paperKey = "Document.Paper";
                let formatKey = `${paperKey}.PaperFormat`;
                let checkMargin: (margin: Margin) => void;

                setup(
                    () =>
                    {
                        let newMargin = {
                            Top: "12cm",
                            Left: "78cm",
                            Bottom: "10cm",
                            Right: "20cm"
                        };

                        settings.Resource.Resource = {
                            [`${paperKey}.Margin`]: newMargin
                        };

                        checkMargin = (margin: Margin) =>
                        {
                            Assert.strictEqual(margin.Top, newMargin.Top);
                            Assert.strictEqual(margin.Left, newMargin.Left);
                            Assert.strictEqual(margin.Bottom, newMargin.Bottom);
                            Assert.strictEqual(margin.Right, newMargin.Right);
                        };
                    });

                test(
                    "Checking whether a correct custom paper-format is loaded if width and height is specified…",
                    () =>
                    {
                        let customFormat = {
                            Width: "28cm",
                            Height: "29cm"
                        };

                        Object.assign(
                            settings.Resource.Resource,
                            {
                                [formatKey]: customFormat
                            });

                        let paperFormat = settings.PaperFormat.Format as CustomPaperFormat;
                        Assert.strictEqual(settings.PaperFormat.Format instanceof CustomPaperFormat, true);
                        Assert.strictEqual(paperFormat.Width, customFormat.Width);
                        Assert.strictEqual(paperFormat.Height, customFormat.Height);
                        checkMargin(settings.PaperFormat.Margin);
                    });

                test(
                    "Checking whether a correct standardized paper-format is loaded if either width or height is not specified…",
                    () =>
                    {
                        Object.assign(
                            settings.Resource.Resource,
                            {
                                [`${formatKey}.Format`]: "A5" as keyof typeof StandardizedFormatType,
                                [`${formatKey}.Orientation`]: "Landscape" as keyof typeof PaperOrientation
                            });

                        let paperFormat = settings.PaperFormat.Format as StandardizedPaperFormat;
                        Assert.strictEqual(settings.PaperFormat.Format instanceof StandardizedPaperFormat, true);
                        Assert.strictEqual(paperFormat.Format, StandardizedFormatType.A5);
                        Assert.strictEqual(paperFormat.Orientation, PaperOrientation.Landscape);
                        checkMargin(settings.PaperFormat.Margin);
                    });

                test(
                    "Checking whether the default paper-format is correct…",
                    () =>
                    {
                        let paperFormat = settings.PaperFormat.Format as StandardizedPaperFormat;
                        Assert.strictEqual(settings.PaperFormat.Format instanceof StandardizedPaperFormat, true);
                        Assert.strictEqual(paperFormat.Format, StandardizedFormatType.A4);
                        Assert.strictEqual(paperFormat.Orientation, PaperOrientation.Portrait);
                        checkMargin(settings.PaperFormat.Margin);
                    });
            });

        suite(
            "TocSettings",
            () =>
            {
                test(
                    "Checking whether the `Toc`-settings equals null if toc is disabled…",
                    () =>
                    {
                        settings.Resource.Resource["Parser.Toc.Enabled"] = false;
                        Assert.strictEqual(settings.TocSettings, null);
                    });

                test(
                    "Checking whether the `ListType`-option is parsed correctly…",
                    () =>
                    {
                        settings.Resource.Resource["Parser.Toc.Enabled"] = true;
                        settings.Resource.Resource["Parser.Toc.ListType"] = "ul";
                        Assert.strictEqual(settings.TocSettings.ListType, ListType.Unordered);
                        settings.Resource.Resource["Parser.Toc.ListType"] = "ol";
                        Assert.strictEqual(settings.TocSettings.ListType, ListType.Ordered);
                    });
            });
    });