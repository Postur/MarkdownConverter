import { strictEqual } from "assert";
import { load } from "cheerio";
import MarkdownIt = require("markdown-it");
import { Random } from "random-js";
import { Document } from "../../../../System/Documents/Document";
import { MarkdownFragment } from "../../../../System/Documents/MarkdownFragment";

/**
 * Registers tests for the {@link MarkdownFragment `MarkdownFragment`} class.
 */
export function MarkdownFragmentTests(): void
{
    suite(
        nameof(MarkdownFragment),
        () =>
        {
            let random: Random;
            let fragment: MarkdownFragment;

            suiteSetup(
                () =>
                {
                    random = new Random();
                });

            setup(
                () =>
                {
                    fragment = new MarkdownFragment(new Document(new MarkdownIt()));
                });

            suite(
                nameof<MarkdownFragment>((fragment) => fragment.Render),
                () =>
                {
                    test(
                        `Checking whether the \`${nameof(MarkdownFragment)}\` is rendered using \`${nameof(MarkdownIt)}\`…`,
                        async () =>
                        {
                            let text = random.string(10);
                            fragment.Content = `**${text}**`;
                            let result = await fragment.Render();

                            strictEqual(load(result)(`:contains("${text}")`).length, 1);
                        });
                });
        });
}
