/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import getBaseUrl from '../helpers/urls';
import contents from '../components/ExtraContents/educational_contents.json';

export const isValidUrl = (url) => {
    try {
        return Boolean(new URL(url));
    } catch (e) {
        return false;
    }
};

function checkForSwagger(service) {
    let hasSwagger = false;
    const serviceAPIKeys = Object.keys(service.apis);
    serviceAPIKeys.forEach((api) => {
        // Statically defined api service has a swagger url for default, but details page doesn't like that.
        // So filter it out for the moment
        if (api !== 'default') {
            const apiObject = service.apis[api];
            if (apiObject?.swaggerUrl) {
                // eslint-disable-next-line no-param-reassign
                hasSwagger = true;
            }
        }
    });
    return hasSwagger;
}

function countValidItems(items, validator) {
    return items.reduce((counter, item) => (validator(item) ? counter + 1 : counter), 0);
}

/**
 * Counts the additional contents
 * @param service
 * @returns {{videosCounter, useCases: *[], useCasesCounter, tutorialsCounter, tutorials: *[], documentation: null, hasSwagger: boolean, videos: *[]}}
 */
export default function countAdditionalContents(service) {
    let hasSwagger = false;
    const { useCases, tutorials, videos, documentation } = contents?.products?.find(
        (product) => service?.serviceId === product.name
    ) || { useCases: [], tutorials: [], videos: [], documentation: null };

    const filteredUseCases = useCases?.filter(({ url }) => isValidUrl(url));
    const filteredTutorials = tutorials?.filter(({ url }) => isValidUrl(url));
    const useCasesCounter = countValidItems(filteredUseCases, (item) => isValidUrl(item.url));
    const tutorialsCounter = countValidItems(filteredTutorials, (item) => isValidUrl(item.url));
    const videosCounter = countValidItems(videos, (item) => isValidUrl(item));

    if (service?.apis) {
        hasSwagger = checkForSwagger(service);
    }

    return {
        useCasesCounter,
        tutorialsCounter,
        videosCounter,
        hasSwagger,
        filteredUseCases,
        filteredTutorials,
        videos,
        documentation,
    };
}

function setButtonsColor(wizardButton, uiConfig, refreshButton) {
    const color =
        uiConfig.headerColor === 'white' || uiConfig.headerColor === '#FFFFFF' ? 'black' : uiConfig.headerColor;
    wizardButton?.style?.setProperty('color', color);
    refreshButton?.style?.setProperty('color', color);
}

function setMultipleElements(uiConfig) {
    if (uiConfig.headerColor) {
        const logoutButton = document.getElementById('go-back-button');
        const title1 = document.getElementById('title');
        const swaggerLabel = document.getElementById('swagger-label');
        const header = document.getElementsByClassName('header');
        const wizardButton = document.querySelector('#onboard-wizard-button > span.MuiButton-label');
        const refreshButton = document.querySelector('#refresh-api-button > span.MuiIconButton-label');
        if (header && header.length > 0) {
            header[0].style.setProperty('background-color', uiConfig.headerColor);
        }
        title1?.style?.setProperty('color', uiConfig.headerColor);
        swaggerLabel?.style?.setProperty('color', uiConfig.headerColor);
        logoutButton?.style?.setProperty('color', uiConfig.headerColor);
        setButtonsColor(wizardButton, uiConfig, refreshButton);
    }
}

/**
 * Retrieve the logo set in the configuration
 * @returns {Promise<T>}
 */
function fetchImagePath() {
    const baseUrl = getBaseUrl().endsWith('/') ? getBaseUrl().slice(0, -1) : getBaseUrl();
    const getImgUrl = `${baseUrl}/custom-logo`;

    return fetch(getImgUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const contentType = response.headers.get('Content-Type');
            return response.blob().then((blob) => {
                const blobWithContentType = new Blob([blob], { type: contentType });
                return URL.createObjectURL(blobWithContentType);
            });
        })
        .catch((error) => {
            throw new Error(`Error fetching image path: ${error.message}`);
        });
}

function handleWhiteHeader(uiConfig) {
    const goBackButton = document.querySelector('#go-back-button');
    const swaggerLabel = document.getElementById('swagger-label');
    const title = document.getElementById('title');
    const productTitle = document.getElementById('product-title');
    if (uiConfig.headerColor === 'white' || uiConfig.headerColor === '#FFFFFF') {
        if (uiConfig.docLink) {
            const docText = document.querySelector('#internal-link');
            docText?.style?.setProperty('color', 'black');
        }
        goBackButton?.style?.setProperty('color', 'black');
        swaggerLabel?.style?.setProperty('color', 'black');
        title?.style?.setProperty('color', 'black');
        productTitle?.style?.setProperty('color', 'black');
    }
}

export const closeMobileMenu = () => {
    document.body.classList.remove('mobile-menu-open');
};

export const openMobileMenu = () => {
    document.body.classList.toggle('mobile-menu-open');
};

/**
 * Custom the UI look to match the setup from the service metadata
 * @param uiConfig the configuration to customize the UI
 */
export const customUIStyle = async (uiConfig) => {
    const root = document.documentElement;
    const logo = document.getElementById('logo');
    if (logo && uiConfig.logo) {
        const img = await fetchImagePath();
        logo.src = img;
        logo.style.height = 'auto';
        logo.style.width = 'auto';
    }

    if (uiConfig.backgroundColor) {
        const homepage = document.getElementsByClassName('apis');
        if (homepage[0]) {
            homepage[0].style.backgroundColor = uiConfig.backgroundColor;
            homepage[0].style.backgroundImage = 'none';
        }

        const detailPage = document.getElementsByClassName('content');
        root.style.backgroundColor = uiConfig.backgroundColor;
        if (detailPage[0]) {
            detailPage[0].style.backgroundColor = uiConfig.backgroundColor;
        }
    }
    setMultipleElements(uiConfig);
    if (uiConfig.fontFamily) {
        const allElements = document.querySelectorAll('*');

        allElements.forEach((element) => {
            element.style.removeProperty('font-family');
            element.style.setProperty('font-family', uiConfig.fontFamily);
        });
        const tileLabel = document.querySelector('p#tileLabel');
        tileLabel?.style?.removeProperty('font-family');
        tileLabel?.style?.setProperty('font-family', uiConfig.fontFamily);
    }
    if (uiConfig.textColor) {
        const description = document.getElementById('description');
        description?.style?.setProperty('color', uiConfig.textColor);
    }
    handleWhiteHeader(uiConfig);
};

export const isAPIPortal = () => process.env.REACT_APP_API_PORTAL === 'true';
