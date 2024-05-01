/** @type {string} Both CSS class for the table of contents and prefix for its id */
const classTOC = "tree-of-contents";

/** @type {string} Both the CSS class for the generated div, and the immutable ID part of all generated elements (used by TreeOfContents.processHashLink()) */
const classTOCBlock = "toc-block";

/** @type {string} CSS class for the invisible element (used by TreeOfContents.processHashLink()) */
const classHidden = "hidden";

/** @type {string} CSS class for the current selected link */
const classCurrent = "current";

/** @type {string} CSS class for the visited link */
const classVisited = "visited";

/** @type {string} Generated link id prefix */
const prefixLink = "link-";

/** @type {string} The name of a custom attribute that contains the id of the tree containing the generated link */
const attrLinkTree = "tree-element";

/** @type {string} The name of a custom attribute that contains the id of the section being referenced by the generated link */
const attrLinkSection = "section";

/** @type {integer} Global variable to ensure continuous numbering of all links in the document */
let blockNumber = 0;

/**
 * Class that creates the tree-like table of contents
 *
 * @export
 * @class TreeOfContents
 */
class TreeOfContents {
  #elementContent;
  #elementTreeOfContents;

  /**
   * Creates an instance of TreeOfContents
   * 
   * @param {Element} elementContent - Element containing content for which a table of contents is generated
   * @param {Array.<string>} [headingTagList] - List of heading tag names to use
   * @param {Element} [elementTreeOfContents] - Parent element for the table of contents. If not specified, it will be created
   * @memberof TreeOfContents
   */
  constructor(elementContent, headingTagList, elementTreeOfContents) {
    this.#elementContent = elementContent;
    if (elementTreeOfContents) {
      this.#elementTreeOfContents = elementTreeOfContents;
    } else {
      this.#elementTreeOfContents = document.body.insertBefore(document.createElement("div"), this.#elementContent);
    }
    if (!this.#elementTreeOfContents.id) {
      this.#elementTreeOfContents.id = classTOC + "-" + elementContent.id;
    }
    this.#elementTreeOfContents.classList.add(classTOC);
    if (headingTagList) {
      this.#initTree(headingTagList);
    } else {
      this.#initTree(["h1", "h2", "h3", "h4", "h5", "h6"]);
    }
  }

  /**
   * Expands a tree branch to display the selected link (see clickTreeItem())
   * @param {Element} link - Current tree link element
   * @memberof TreeOfContents
   * @static
   */
  static expandTreeBranch(link) {
    let itemToOpen = link.parentElement;
    while (itemToOpen) {
      if (itemToOpen.nodeName === "DETAILS") {
        itemToOpen.setAttribute("open", "");
      }
      itemToOpen = itemToOpen.parentElement;
    }
  }

  /**
   * Onclick event listener of tree link element
   *
   * @memberof TreeOfContents
   * @static
   */
  static clickTreeItem() {
    // Attention! This is an event listener, so remember that "this" here is an <a> link, not a TreeOfContents object!
    TreeOfContents.expandTreeBranch(this);

    let div = document.getElementById(this.getAttribute(attrLinkSection));
    let content = div.parentElement;
    content.childNodes.forEach(current => {
      if (current.nodeName === "DIV") {
        current.classList.add(classHidden);
      }
    });
    div.classList.remove(classHidden);
    content.classList.remove(classHidden);

    document.getElementById(this.getAttribute(attrLinkTree)).querySelectorAll("a").forEach(link => {
      if (link === this) {
        link.classList.add(classCurrent, classVisited);
      } else {
        link.classList.remove(classCurrent);
      }
    });
  }

  /**
   * Find the element by the href, expand the tree branch that relates to it. This function is called either by
   * the onclick event listener of internal link elements (i.e. <a href="#...">) or if the page URL contains such a link
   *
   * @param {string} href - Link href to process; either "#link" or "http://some.url#link"
   * @param {boolean} [forceScroll=false] - If true, then force the browser to scroll the window to the desired element
   * @return {boolean} - Always true to force the browser to scroll to target href element of the link
   * @memberof TreeOfContents
   * @static
   */
  static processHashLink(href, forceScroll = false) {
    let targetElement = document.getElementById(href.split("#")[1]);
    if (targetElement) {
      let divToShow = targetElement.closest("." + classTOCBlock);
      if (divToShow && divToShow.closest("." + classHidden)) {
        let linkTOC = document.getElementById(prefixLink + divToShow.id);
        if (linkTOC) {
          linkTOC.click();
        }
        if (forceScroll) {
          targetElement.scrollIntoView();
        }
      }
    }
    return true;
  }

  /**
   * Generates a tree of contents
   *
   * @param {Array.<string>} headingTagList - List of heading elements to use
   * @memberof TreeOfContents
   * @private
   */
  #initTree(headingTagList) {
    if (this.#elementContent) {
      let headingList = this.#elementContent.querySelectorAll(headingTagList.toString());

      if (headingList) {
        this.#updateLinks(window.location.href.split("#")[0]);

        /* variables */
        let blockId = "";
        let prevLevel = -1;
        let currentLevel;
        let ulRootTreeNode;
        let ulCurrentTreeNode;
        let liCurrentTreeNode;
        let rangeCurrent;
        let headerLevelList = this.#sortedNodeNameList(headingList, headingTagList);

        headingList.forEach(headerCurrent => {
          if (blockId !== "" && rangeCurrent) {
            rangeCurrent.setEndBefore(headerCurrent);
            this.#wrapRangeWithDiv(rangeCurrent, blockId).classList.add(classTOCBlock);
          }

          blockId = classTOCBlock + blockNumber++;
          rangeCurrent = new Range();
          rangeCurrent.setStartBefore(headerCurrent, 0);

          for (currentLevel = headerLevelList.indexOf(headerCurrent.nodeName.toUpperCase()); currentLevel > prevLevel;
            prevLevel++) {
            let tmp = document.createElement("ul");
            if (prevLevel === -1 || !liCurrentTreeNode) {
              ulRootTreeNode = tmp;
            } else {
              let details = liCurrentTreeNode.appendChild(document.createElement("details"));
              if (liCurrentTreeNode.childNodes[0].nodeName === "A") {
                details.appendChild(document.createElement("summary")).appendChild(liCurrentTreeNode.childNodes[0]);
              }
              details.appendChild(tmp);
            }
            if (currentLevel > prevLevel + 1) {
              liCurrentTreeNode = tmp.appendChild(document.createElement("li"));
            }
            ulCurrentTreeNode = tmp;
          }

          while (currentLevel < prevLevel) {
            ulCurrentTreeNode = ulCurrentTreeNode.parentElement.closest("ul");
            prevLevel--;
          }
          liCurrentTreeNode = ulCurrentTreeNode.appendChild(document.createElement("li"));
          this.#createTreeLink(liCurrentTreeNode, headerCurrent.innerHTML, blockId)
        });

        if (blockId !== "" && rangeCurrent) {
          let rangeLast = new Range;
          rangeLast.selectNodeContents(this.#elementContent);
          rangeLast.setStart(rangeCurrent.startContainer, rangeCurrent.startOffset);
          this.#wrapRangeWithDiv(rangeLast, blockId);
        }

        this.#elementTreeOfContents.appendChild(ulRootTreeNode);

        if (window.location.href.includes("#")) {
          TreeOfContents.processHashLink(window.location.href, true);
        }
      }
    }
  }

  /**
   * Attaches the onclick event listener to tree link elements
   *
   * @param {string} strCurrentURL - If current URL contains the hash char "#"" then this is its prefix before the hash char
   * @memberof TreeOfContents
   * @private
   */
  #updateLinks(strCurrentURL) {
    let linkList = document.querySelectorAll("a");
    if (linkList) {
      linkList.forEach(linkCurrent => {
        let href = linkCurrent.href;
        if (href.charAt(0) === "#" || strCurrentURL !== "" && href.indexOf(strCurrentURL) === 0) {
          linkCurrent.addEventListener("click", (e) => {
            return TreeOfContents.processHashLink(e.currentTarget.getAttribute("href"));
          }, false);
        }
      });
    }
  }

  /**
   * Creates tree link
   *
   * @param {Element} parent - Parent of the link element
   * @param {string} innerHTML - Content of the link
   * @param {string} id - Id of the link
   * @memberof TreeOfContents
   * @private
   */
  #createTreeLink(parent, innerHTML, id) {
    let link = parent.appendChild(document.createElement("a"));
    /* TODO: direct assignment to innerHTML seems problematic because the inner HTML of the heading element might
       contain someting inappropriate for the <a>. I tried createTextNode(), but it doesn't works correctly if the
       heading's innerHTML contains style tags (<sub>, <strong>, etc.). I also tried the Range object, but this idea is
       even worse */
    link.innerHTML = innerHTML;
    link.id = prefixLink + id;
    link.setAttribute(attrLinkSection, id);
    link.setAttribute(attrLinkTree, this.#elementTreeOfContents.id);
    link.setAttribute("href", "javascript://");
    link.addEventListener("click", TreeOfContents.clickTreeItem);
  }

  /**
   * Auxiliary function: surronds the Range with newly created <div> with given id
   * 
   * @param {Range} range - Range to surround
   * @param {string} idNewDiv - New <div> identifier
   * @return {Element} Newly created <div> itself
   * @memberof TreeOfContents
   * @private
   */
  #wrapRangeWithDiv(range, idNewDiv) {
    let div = document.createElement("div");
    div.id = idNewDiv;
    range.surroundContents(div);
    return div;
  }

  /**
   * Auxiliary function: given a list of elements, returns a list of their unique node names, sorted according to
   * tagOrderList
   *
   * @param {Array.<Element>} elementList - List of elements to process
   * @param {Array.<string>} tagOrderList - List of tag names to define the order
   * @return {Array.<string>} Sorted list of node names
   * @memberof TreeOfContents
   * @private
   */
  #sortedNodeNameList(elementList, tagOrderList) {
    let tagOrderListU = tagOrderList.map((str) => str.toUpperCase());
    let elementSetU = new Set();
    elementList.forEach(child => {
      elementSetU.add(child.nodeName.toUpperCase());
    });
    return Array.from(elementSetU).sort((a, b) => tagOrderListU.indexOf(a) - tagOrderListU.indexOf(b));
  }
}
