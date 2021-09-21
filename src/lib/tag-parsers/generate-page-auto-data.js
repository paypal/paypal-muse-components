import parseOgTags from './og-parser';
import parseJsonLd from './jsonld-parser';
import { _get } from "../utils";

const generateOgData = () => {
    const ogTags = parseOgTags();
    const hasOgTags = Array.isArray(ogTags) && ogTags.length > 0
    return hasOgTags ? {
        type: "open_graph",
        version: 1,
        data: ogTags
    } : null;
}

const generateJSONldData = () => {
    const ldTags = parseJsonLd();
    const hasLdTags = Array.isArray(ldTags) && ldTags.length > 0
    return hasLdTags ? {
        type: "schema.org/ld+json",
        version: 1,
        data: ldTags
    }  : null;
}

export const generatePageAutoData = () => {
    const autoData = [];

    const ogTagsData = generateOgData();
    if (ogTagsData) {
        autoData.push(ogTagsData);
    }
    const ldTagsData = generateJSONldData();
    if (ldTagsData) {
        autoData.push(ldTagsData);
    }

    return autoData;
}
