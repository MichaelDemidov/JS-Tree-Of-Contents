Tree of Contents (JavaScript)
=============================

What Is It?
-----------

This is a simple JavaScript class that converts a “flat” HTML document into a tree-like form: it creates a table of contents as a tree whose nodes can be collapsed and expanded, and makes invisible the part of the document that is not referenced by the selected node. This behavior is similar to Windows help files with tree-like table of contents (`*.hlp` and `*.chm`), interactive books and so on.

The easiest way to illustrate this is with two pictures: without the script and with it (or before and after).

**A document without the table of contents:**

![A document without the table of contents](images/no_toc.jpg)

**The same document with the table of contents:**

![The same document with the table of contents](images/toc.jpg)

> [!IMPORTANT]
> The source code is provided *as is,* since I mainly did this project for myself, but I will be glad if someone finds it useful. Also, I physically could not test the script on a large number of browsers and especially mobile devices. Thus, I won’t mind if someone finds errors or wants to help the project in a different way.

Requirements
------------

The script itself requires ECMAScript 6 and HTML 5. The project uses the [TreeView](https://github.com/MichaelDemidov/HTML-TreeView) submodule which also requires HTML 5 and CSS 3.0.

I think it’s possible to rewrite the code to reduce the requirements if someone needs it, but I haven’t done it myself and haven’t tested it on very old browsers like Internet Explorer.

How It Works?
-------------

### Class Constructor

There is a `TreeOfContents` class that is instantiated in the document `onload` event handler:

```JavaScript
let elementContent = document.getElementById("content");
let headingTagList = ["h1", "h2", "h3"];
let elementTreeOfContents = document.getElementById("table-of-contents");
new TreeOfContents(elementContent, headingTagList, elementTreeOfContents);
```

The **first and only required parameter** passed to the class constructor (here it is the `elementContent`) is an element that contains text marked up with *headings.* The *heading* here is any tag, usually it is `<h…>`.

The **second optional parameter** is an array containing all of these heading tags in nesting order. If an array is not specified the default list of HTML heading tags from `<h1>` to `<h6>` is used. The script uses these tags as “milestones” to divide the text into parts and simultaneously creates a tree of these headings. The tree is built from bulleted lists `<ul>` and collapsible HTML5 elements `<details>` and `<summary>` if needed. Each tree element contains a link to the corresponding part of the document, and all these parts are initially made invisible.

The tree constructed in this way is placed either in an element passed to the `TreeOfContents` class constructor as a last **third (also optional) parameter,** or in a `<div class="tree-of-contents">` element that the class creates itself if the last constructor parameter is not spacified. Clicking on a link in the tree makes the document part visible (custom `<a>` tag attributes are used for this).

### Building a Hierarchy

The main difficulty is that the HTML document actually does not have any hierarchy connecting the headings of different levels with each other and with the content of the corresponding sections. The heading is not connected in any way to the text that follows it. Therefore, the script considers the section content to be everything placed between the heading and the following heading or the end of the text. If the next heading has a lower level than the current one, then the script considers that the next heading is nested inside the current section.

To divide the document into parts, the script uses the `Range` class, which has a useful `surroundContents()` method. Without this class and its method, solving the problem would be hard because the script would have to cut out some of the content and paste it back.

> [!CAUTION]
> If the structure of the document is broken, that is, there are unclosed tags or headings are nested within other elements, the script will most likely produce strange results or not work at all.

### Levels Nesting

In any tree branch, the depth of a node’s nesting is determined by the heading level. [As stated above](#class-constructor), the order of levels is specified by the second parameter of the class constructor. By default, the standard HTML heading scheme is used, where `<h1>` is the top level and `<h6>` is the bottom level, but you can use other tags or change the nesting order of the headings, for example, making the `<h3>` higher than `<h2>`.

The script is “smart” enough to handle situations where some heading levels in the list don’t exist in the content, such as a document containing only `<h1>`, `<h2>` and `<h4>` headings: it treats the `<h4>` heading as a third level rather than a fourth. Additionally, if there is a gap in the heading numbering of one of the branches (that is not present in the other branches), the script inserts a “fake” tree node to maintain equal nesting levels compared to other branches.

### Internal Links (Anchors) And URLs Containing Direct Links to Parts of the Document

The tree structure gives rise to two problems at once regarding *internal links.* Firstly, if there is a link from one part of the document to another (`<a href="#element_id">`, `<a href="page.html#element_id">`, etc.), then such a link must be processed in a more complex way than usual. By default, the browser simply scrolls the document to the element with the given id, but in the case of a tree, you first need to find which section this element falls into, expand the tree branch that refers that section, show the corresponding fragment of the document, and finally allow the browser to scroll the document to the element. Secondly, if the URL contains the hash character plus the name of the element, then when loading the page the script needs to perform the same actions.

The script solves this problem this way: an additional `onclick` event listener is attached to any link with a `href` attribute that consists of either a single word peceded by a hash character (for example, `<a href="#element_id">`) or contains the URL of the current page plus a hash charater and the element id (e.g. `<a href="http://mysite.com/page.html#element_id">`). The event listener performs all the necessary actions, see the static `TreeOfContents.processHashLink()` method. And the same method is called in the class constructor if the page URL contains a hash character.

### Appearance

The script rely on the [TreeView](https://github.com/MichaelDemidov/HTML-TreeView) submodule to stylize the tree. Please read [the TreeView readme file](https://github.com/MichaelDemidov/HTML-TreeView//blob/main/README.md) for more details on the visual aspects and the difference between raster and vector SVG icon sets.

To view a document with vector SVG icons, simply comment out the line `<link rel="stylesheet" href="HTML-TreeView/toc-png-icons.css" />` in the file `index.html` and uncomment the line `<link rel="stylesheet" href="HTML-TreeView/toc-svg-icons.css" />` (or vice versa to return PNG icons).

### Individual Node Icons

All tree node icons are the same (either opened / closed “folder” or “document”), but sometimes we need to change one or more of them. To do this, I implemented the following feature: if a heading has a class with a name starting with “icon-” (see the `prefixIcon` constant), that same class is assigned to the tree node (the `<li>` element) that contains a link to this heading. This allows us to assign unique icons to some sections via CSS, for example see _Tallentyre_ marked with a warning sign.

### Final Remarks

I tried to make the JS code, CSS, and HTML minimally dependent on each other. Of course, the script uses some CSS class names, but, firstly, there are not many of them, and secondly, all these names are placed at the very beginning of the script file as string constants, so they are easy to rename. And the only CSS class that is absolutely necessary is the class `hidden`, because it controls the visibility of elements (I also didn’t use tricks like setting the `display` property to `none` in the script itself — I just assigned the objects the CSS class `hidden`). All other classes are intended for visual design and can easily be redefined as desired.

Known Issues / To Do
--------------------

The `TreeOfContents.#createTreeLink()` private method contains direct assignment to a link’s `innerHTML` property. It seems problematic because the inner HTML of the heading element might contain someting inappropriate for the link `<a>`. I tried `createTextNode()`, but it doesn’t works correctly if the heading’s `innerHTML` property contains style tags (`<sub>`, `<strong>`, etc.). I also tried the `Range` object, but this idea is even worse. If anyone has any ideas, please tell me.

Another issue is related to the browser’s built-in text search function on the current page (with hidden text): depending on the specific browser, it either doesn’t not work at all or works incorrectly. It might make sense to implement own search function on hidden elements.

And one more idea for the (possible) future: to add the ability to display the entire contents of a document at once, that is, temporarily or permanently disable hiding of all sections except the current one. It’s not very difficult to implement.

**To do:** How to handle the situation if the content for building the table of contents is not static, but is generated asynchronously by another script?

A Little Bonus
--------------

This is itself part of a collection of quotes in various languages that I have been collecting since the mid-2000s.

Author
------
Copyright (c) 2024, Michael Demidov

Visit my GitHub page to check for updates, report issues, etc.: https://github.com/MichaelDemidov

Drop me an e-mail at: michael.v.demidov@gmail.com
