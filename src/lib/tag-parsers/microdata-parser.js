import {tryAndLog} from "../utils";

const setProperty = (prop, value, jsonResult) => {
    if (!jsonResult[prop]) return jsonResult[prop] = value

    // if a property on the object exists, then convert the property into an Array before pushing our value
    if (!Array.isArray(jsonResult[prop])) jsonResult[prop] = [jsonResult[prop]]
    if (Array.isArray(jsonResult[prop])) return jsonResult[prop].push(value)
}

function parseMicrodata (schemaNode, jsonResult) {
    for (let child of schemaNode.children) {
        if (child.hasAttribute("itemprop") && child.hasAttribute("itemscope")) {
            const valueObj = {"@type": child.getAttribute("itemtype")};
            setProperty(child.getAttribute("itemprop"), valueObj, jsonResult)

            parseMicrodata(child, valueObj)
        }
        else if (child.hasAttribute("itemprop")) {
            setProperty(child.getAttribute("itemprop"),
                child.getAttribute("content") || child.getAttribute("src") || child.getAttribute("href") || child.textContent,
                jsonResult)
        }
    }
}

const parseTags = ({schemaType}) => {
    const jsonResult = {
        "@context": "https://schema.org",
        "@type": schemaType
    };

    const schemaNodes = document.querySelectorAll(`[itemtype="https://schema.org/${schemaType}"]`)

    if (!schemaNodes || schemaNodes.length === 0) {
        return;
    }

    const schemaNode = schemaNodes[0]; // we are only interested in the first as our payload size is limited
    parseMicrodata(schemaNode, jsonResult)
    return jsonResult
}

const parse = tryAndLog(parseTags);

export default parse;
