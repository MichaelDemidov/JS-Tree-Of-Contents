Tree of Contents (HTML + JavaScript + CSS)
==========================================

What Is It?
-----------

This is a simple JavaScript class that creates a tree-like table of contents whose nodes can be collapsed and expanded. The part of the HTML document that does not belong to the selected node becomes invisible. The easiest way to illustrate this is with a picture.

![A document without the table of contents](images/no_toc.jpg) ![The same document with the table of contents](images/toc.jpg)

> [!NOTE]
> The source code is provided as is, since I mainly did this project for myself, but I will be glad if someone finds it useful. Also, I physically could not test the script on a large number of browsers and especially mobile devices. Thus, I won’t mind if someone finds errors or wants to help the project in a different way.

Requirements
------------

HTML 5, ECMAScript 6, and CSS 3.0. I also used scalable SVG icons that I drew myself for the tree elements (these are included in the CSS in Base64 encoded form and placed in the `images` folder as SVG images at the same time).

I think it's possible to rewrite the code to reduce the requirements if someone needs it, but I haven't done it myself and haven't tested it on very old browsers like Internet Explorer.

How It Works?
-------------

There is a `TreeOfContents` class that is instantiated in the document `onload` event handler. An element is passed to the class constructor contains text marked up using headings of different levels (from H1 to H6). The script uses them as “milestones” to divide the text into parts and simultaneously creates a tree of these headings. The tree is built from bulleted lists `<ul>` and collapsible HTML5 elements `<details>` and `<summary>` if needed. Each tree element contains a link to the corresponding part of the document, and all these parts are initially made invisible. The tree constructed in this way is placed either in an element passed to the `TreeOfContents` class constructor as the second parameter, or in an element `<div class="tree-of-contents">` that the class creates itself if the second constructor parameter is not spacified. Clicking on a link in the tree makes the document part visible (custom `<a>` tag attributes are used for this).

The main difficulty is that the HTML document actually does not have any hierarchy connecting the headings of different levels with each other and with the content of the corresponding sections. The heading is not connected in any way to the text that follows it. Therefore, the script considers the section content to be everything placed between the heading and the following heading or the end of the text. If the next heading has a lower level than the current one, then the script considers that the next heading is nested inside the current section.

To divide the document into parts, the script uses the `Range` class, which has a useful `surroundContents()` method. Without this class and its method, solving the problem would be hard because the script would have to cut out some of the content and paste it back.

> [!CAUTION]
> If the structure of the document is broken, that is, there are unclosed tags or headings are nested within other elements, the script will most likely produce strange results or not work at all.

In any tree branch, the depth of a node's nesting is determined by the header level. The script is “smart” enough to handle situations where some header level does not exist, such as a document containing only H1, H2 and H4 headings: it treats the H4 heading as a third level rather than a fourth. Additionally, if one of the branch of the tree has a gap in the header numbering, the script inserts a “fake” tree node to maintain equal nesting levels compared to other branches.

I tried to make the JS code, CSS, and HTML minimally dependent on each other. Of course, the script uses some CSS class names, but, firstly, there are not many of them, and secondly, all these names are placed at the very beginning of the script file as string constants, so they are easy to rename. And the only CSS class that is absolutely necessary is the class `hidden`, because it controls the visibility of elements (I also didn't use tricks like setting the `display` property to `none` in the script itself — I just assigned the objects the CSS class `hidden`). All other classes are intended for visual design and can easily be redefined as desired.

A Little Bonus
--------------

This is itself part of a collection of quotes in various languages that I have been collecting since the mid-2000s.

Author
------
Copyright (c) 2024, Michael Demidov

Visit my GitHub page to check for updates, report issues, etc.: https://github.com/MichaelDemidov

Drop me an e-mail at: michael.v.demidov@gmail.com
