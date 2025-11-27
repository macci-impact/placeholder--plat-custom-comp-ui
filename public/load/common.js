import {project, environments} from './environment.js';


export async function loadWithEnvFriend(scriptToLoad) {
    await loadEnvironmentFriendIfNeeded();
    await addScript(scriptToLoad, project, environments);
}

export async function importForEnvironment(file) {
    await loadEnvironmentFriendIfNeeded();

    const url = await window.__envfriend.getEnvironmentUrl(
        getCdnUrlTemplate(file), {
            project,
            environments,
        });

    return import(url);
}

const ENV_FRIEND = "https://js-cdn.impact.com/npm/envfriend@0.0.16/dist/tool.js";

function getCdnUrlTemplate(file) {
    return `https://ui.assets.impact.com/${project}/{env}/${file}.js`;
}

async function loadEnvironmentFriendIfNeeded() {

    return new Promise((resolve) => {

        if (!window.__envfriend) {
            const script = document.createElement("script");
            script.setAttribute("src", ENV_FRIEND);
            script.setAttribute("type", "module");
            script.onload = () => {
                resolve();
            };

            document.head.appendChild(script);
        } else {
            resolve();
        }

    });

}

async function addScript(scriptToLoad, project, environments) {

    const url = await window.__envfriend.getEnvironmentUrl(
        scriptToLoad, {
            project,
            environments,
        });

    return new Promise((resolve) => {
        let script = document.createElement("script");
        script.setAttribute("src", url);
        script.setAttribute("type", "module");
        script.onload = function () {
            resolve();
        };

        document.head.appendChild(script);
    });

}

export async function load(file) {
    await loadWithEnvFriend(getCdnUrlTemplate(file));
}

export default async function loadAndMount(params) {
    const {file, globalName, props, target} = params;
    await loadWithEnvFriend(getCdnUrlTemplate(file));
    globalThis[globalName || file](props || {}).mount(target);
}