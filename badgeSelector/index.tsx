import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { addProfileBadge, removeProfileBadge } from "@api/Badges";
import { Toasts, useState, useEffect } from "@webpack/common";
import * as DataStore from "@api/DataStore";

var BADGE_DATA_KEY = "BadgeSelector_v2_data";

function getNitroSinceDate(months) {
    var currentDate = new Date();
    var sinceDate = new Date(currentDate);
    sinceDate.setMonth(currentDate.getMonth() - months);
    var month = sinceDate.getMonth() + 1;
    var day = sinceDate.getDate();
    var year = sinceDate.getFullYear();
    return month + "/" + day + "/" + year.toString().slice(-2);
}

function getBoostSinceDate(months) {
    var currentDate = new Date();
    var sinceDate = new Date(currentDate);
    sinceDate.setMonth(currentDate.getMonth() - months);
    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[sinceDate.getMonth()] + " " + sinceDate.getDate() + ", " + sinceDate.getFullYear();
}

var availableBadges = [
    { id: "staff", title: "Discord Staff", description: "Discord Staff", icon: "5e74e9b61934fc1f67c65515d1f7e60d", link: "https://discord.com/company" },
    { id: "premium", title: "Nitro Subscriber", description: "Subscriber since Dec 22, 2016", icon: "2ba85e8026a8614b640c2837bcdfe21b", link: "https://discord.com/settings/premium" },
    { id: "premium_tenure_1_month_v2", title: "Nitro Bronze (1 month)", description: "Subscriber since " + getNitroSinceDate(1), icon: "4f33c4a9c64ce221936bd256c356f91f", link: "https://discord.com/nitro" },
    { id: "premium_tenure_3_month_v2", title: "Nitro Silver (3 months)", description: "Subscriber since " + getNitroSinceDate(3), icon: "4514fab914bdbfb4ad2fa23df76121a6", link: "https://discord.com/nitro" },
    { id: "premium_tenure_6_month_v2", title: "Nitro Gold (6 months)", description: "Subscriber since " + getNitroSinceDate(6), icon: "2895086c18d5531d499862e41d1155a6", link: "https://discord.com/nitro" },
    { id: "premium_tenure_12_month_v2", title: "Nitro Platinum (1 year)", description: "Subscriber since " + getNitroSinceDate(12), icon: "0334688279c8359120922938dcb1d6f8", link: "https://discord.com/nitro" },
    { id: "premium_tenure_24_month_v2", title: "Nitro Diamond (2 years)", description: "Subscriber since " + getNitroSinceDate(24), icon: "0d61871f72bb9a33a7ae568c1fb4f20a", link: "https://discord.com/nitro" },
    { id: "premium_tenure_36_month_v2", title: "Nitro Emerald (3 years)", description: "Subscriber since " + getNitroSinceDate(36), icon: "11e2d339068b55d3a506cff34d3780f3", link: "https://discord.com/nitro" },
    { id: "premium_tenure_60_month_v2", title: "Nitro Ruby (5 years)", description: "Subscriber since " + getNitroSinceDate(60), icon: "cd5e2cfd9d7f27a8cdcd3e8a8d5dc9f4", link: "https://discord.com/nitro" },
    { id: "premium_tenure_72_month_v2", title: "Nitro Opal (6+ years)", description: "Subscriber since " + getNitroSinceDate(72), icon: "5b154df19c53dce2af92c9b61e6be5e2", link: "https://discord.com/nitro" },
    { id: "partner", title: "Partnered Server Owner", description: "Partnered Server Owner", icon: "3f9748e53446a137a052f3454e2de41e", link: "https://discord.com/partners" },
    { id: "certified_moderator", title: "Moderator Programs Alumni", description: "Moderator Programs Alumni", icon: "fee1624003e2fee35cb398e125dc479b", link: "https://discord.com/safety" },
    { id: "hypesquad", title: "HypeSquad Events", description: "HypeSquad Events", icon: "bf01d1073931f921909045f3a39fd264", link: "https://discord.com/hypesquad" },
    { id: "hypesquad_house_1", title: "HypeSquad Bravery", description: "HypeSquad Bravery", icon: "8a88d63823d8a71cd5e390baa45efa02", link: "https://discord.com/settings/hypesquad-online" },
    { id: "hypesquad_house_2", title: "HypeSquad Brilliance", description: "HypeSquad Brilliance", icon: "011940fd013da3f7fb926e4a1cd2e618", link: "https://discord.com/settings/hypesquad-online" },
    { id: "hypesquad_house_3", title: "HypeSquad Balance", description: "HypeSquad Balance", icon: "3aa41de486fa12454c3761e8e223442e", link: "https://discord.com/settings/hypesquad-online" },
    { id: "bug_hunter_level_1", title: "Discord Bug Hunter", description: "Discord Bug Hunter", icon: "2717692c7dca7289b35297368a940dd0", link: "https://support.discord.com/hc/en-us/articles/360046057772-Discord-Bugs" },
    { id: "bug_hunter_level_2", title: "Discord Bug Hunter Gold", description: "Discord Bug Hunter", icon: "848f79194d4be5ff5f81505cbd0ce1e6", link: "https://support.discord.com/hc/en-us/articles/360046057772-Discord-Bugs" },
    { id: "active_developer", title: "Active Developer", description: "Active Developer", icon: "6bdc42827a38498929a4920da12695d9", link: "https://support-dev.discord.com/hc/en-us/articles/10113997751447?ref=badge" },
    { id: "verified_developer", title: "Early Verified Bot Developer", description: "Early Verified Bot Developer", icon: "6df5892e0f35b051f8b61eace34f4967", link: "https://discord.com/developers" },
    { id: "early_supporter", title: "Early Supporter", description: "Early Supporter", icon: "7060786766c9c840eb3019e725d2b358", link: "https://discord.com/settings/premium" },
    { id: "guild_booster_lvl1", title: "Server Boost 1 Month", description: "Server boosting since " + getBoostSinceDate(1), icon: "51040c70d4f20a921ad6674ff86fc95c", link: "https://discord.com/settings/premium" },
    { id: "guild_booster_lvl2", title: "Server Boost 2 Months", description: "Server boosting since " + getBoostSinceDate(2), icon: "0e4080d1d333bc7ad29ef6528b6f2fb7", link: "https://discord.com/settings/premium" },
    { id: "guild_booster_lvl3", title: "Server Boost 3 Months", description: "Server boosting since " + getBoostSinceDate(3), icon: "72bed924410c304dbe3d00a6e593ff59", link: "https://discord.com/settings/premium" },
    { id: "guild_booster_lvl4", title: "Server Boost 6 Months", description: "Server boosting since " + getBoostSinceDate(6), icon: "df199d2050d3ed4ebf84d64ae83989f8", link: "https://discord.com/settings/premium" },
    { id: "guild_booster_lvl5", title: "Server Boost 9 Months", description: "Server boosting since " + getBoostSinceDate(9), icon: "996b3e870e8a22ce519b3a50e6bdd52f", link: "https://discord.com/settings/premium" },
    { id: "guild_booster_lvl6", title: "Server Boost 12 Months", description: "Server boosting since " + getBoostSinceDate(12), icon: "991c9f39ee33d7537d9f408c3e53141e", link: "https://discord.com/settings/premium" },
    { id: "guild_booster_lvl7", title: "Server Boost 15 Months", description: "Server boosting since " + getBoostSinceDate(15), icon: "cb3ae83c15e970e8f3d410bc62cb8b99", link: "https://discord.com/settings/premium" },
    { id: "guild_booster_lvl8", title: "Server Boost 18 Months", description: "Server boosting since " + getBoostSinceDate(18), icon: "7142225d31238f6387d9f09efaa02759", link: "https://discord.com/settings/premium" },
    { id: "guild_booster_lvl9", title: "Server Boost 24 Months", description: "Server boosting since " + getBoostSinceDate(24), icon: "ec92202290b48d0879b7413d2dde3bab", link: "https://discord.com/settings/premium" },
    { id: "legacy_username", title: "Legacy Username", description: "Originally known as their old username", icon: "6de6d34650760ba5551a79732e98ed60", link: "https://discord.com" },
    { id: "quest_completed", title: "Quest Completer", description: "Completed a Quest", icon: "7d9ae358c8c5e118768335dbe68b4fb8", link: "https://discord.com/settings/inventory" },
    { id: "bot_commands", title: "Supports Commands", description: "Supports Commands", icon: "6f9e37f9029ff57aef81db857890005e", link: "https://discord.com/blog/welcome-to-the-new-era-of-discord-apps?ref=badge" },
    { id: "automod", title: "Uses AutoMod", description: "Uses automod", icon: "f2459b691ac7453ed6039bbcfaccbfcd", link: "https://discord.com" },
    { id: "application_guild_subscription", title: "Server Subscription", description: "Monetized server", icon: "d2010c413a8da2208b7e4311042a4b9d", link: "https://discord.com" },
    { id: "orb_profile_badge", title: "Orbs", description: "Collected the Orb Profile Badge", icon: "83d8a1eb09a8d64e59233eec5d4d5c2d", link: "https://discord.com" }
];

// ─── Data Layer ─────────────────────────────────────────────────

var badgeData = {};
var registeredBadgeRef = null;

async function loadData() {
    try {
        var saved = await DataStore.get(BADGE_DATA_KEY);
        return saved || {};
    } catch (e) {
        console.error("[BadgeSelector] Failed to load data:", e);
        return {};
    }
}

async function saveData(data) {
    try {
        badgeData = data;
        await DataStore.set(BADGE_DATA_KEY, data);
    } catch (e) {
        console.error("[BadgeSelector] Failed to save data:", e);
    }
}

function getBadgeInfo(id) {
    return availableBadges.find(function(b) { return b.id === id; });
}

// ─── Settings UI Component ───────────────────────────────────────

var BadgeManagerComponent = function() {
    var dataState = useState(badgeData);
    var data = dataState[0];
    var setData = dataState[1];

    var inputState = useState("");
    var inputUserId = inputState[0];
    var setInputUserId = inputState[1];

    var expandedState = useState(null);
    var expandedUser = expandedState[0];
    var setExpandedUser = expandedState[1];

    useEffect(function() {
        loadData().then(function(d) {
            badgeData = d;
            setData(Object.assign({}, d));
        });
    }, []);

    var updateData = async function(newData) {
        await saveData(newData);
        setData(Object.assign({}, newData));
    };

    var addUser = async function() {
        var uid = inputUserId.trim();
        if (!uid) return;
        var newData = Object.assign({}, data);
        if (!newData[uid]) {
            newData[uid] = { added: [], removed: [], custom: [] };
        }
        await updateData(newData);
        setExpandedUser(uid);
        setInputUserId("");
        Toasts.show({ message: "Now managing badges for " + uid, type: Toasts.Type.SUCCESS, id: Toasts.genId() });
    };

    var removeUser = async function(uid) {
        var newData = Object.assign({}, data);
        delete newData[uid];
        await updateData(newData);
        if (expandedUser === uid) setExpandedUser(null);
    };

    var toggleAdded = async function(uid, badgeId) {
        var config = data[uid];
        if (!config) return;
        var added = config.added.includes(badgeId)
            ? config.added.filter(function(id) { return id !== badgeId; })
            : config.added.concat([badgeId]);
        var newConfig = Object.assign({}, config, { added: added });
        await updateData(Object.assign({}, data, (function() { var o = {}; o[uid] = newConfig; return o; })()));
    };

    var toggleRemoved = async function(uid, badgeId) {
        var config = data[uid];
        if (!config) return;
        var removed = config.removed.includes(badgeId)
            ? config.removed.filter(function(id) { return id !== badgeId; })
            : config.removed.concat([badgeId]);
        var newConfig = Object.assign({}, config, { removed: removed });
        await updateData(Object.assign({}, data, (function() { var o = {}; o[uid] = newConfig; return o; })()));
    };

    var giveAll = async function(uid) {
        var allIds = availableBadges.map(function(b) { return b.id; });
        var newConfig = Object.assign({}, data[uid], { added: allIds, removed: [] });
        await updateData(Object.assign({}, data, (function() { var o = {}; o[uid] = newConfig; return o; })()));
        Toasts.show({ message: "All badges added!", type: Toasts.Type.SUCCESS, id: Toasts.genId() });
    };

    var removeAll = async function(uid) {
        var newConfig = { added: [], removed: [], custom: [] };
        await updateData(Object.assign({}, data, (function() { var o = {}; o[uid] = newConfig; return o; })()));
        Toasts.show({ message: "All badges cleared!", type: Toasts.Type.SUCCESS, id: Toasts.genId() });
    };

    var entries = Object.keys(data);

    var sContainer = { padding: "10px 0" };
    var sInputRow = { display: "flex", gap: "8px", marginBottom: "16px" };
    var sInput = { flex: 1, padding: "8px 12px", background: "var(--input-background, #383a40)", border: "1px solid var(--input-background, #383a40)", borderRadius: "6px", color: "var(--text-normal, #dbdee1)", fontSize: "14px", outline: "none", fontFamily: "monospace", boxSizing: "border-box" };
    var sBtn = { padding: "8px 16px", background: "var(--brand-500, #5865f2)", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "13px", whiteSpace: "nowrap" };
    var sBtnDanger = Object.assign({}, sBtn, { background: "var(--red-400, #f23f43)" });
    var sBtnGhost = { padding: "6px 12px", background: "var(--background-modifier-hover, rgba(79,84,92,.16))", color: "var(--text-normal, #dbdee1)", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: 500 };
    var sBtnSmall = { padding: "2px 8px", background: "none", border: "none", color: "var(--text-muted, #949ba4)", cursor: "pointer", fontSize: "16px", lineHeight: 1 };
    var sUserHeader = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "var(--background-secondary, #2b2d31)", borderRadius: "6px", cursor: "pointer", marginBottom: "4px" };
    var sUserId = { color: "var(--header-primary, #f2f3f5)", fontSize: "14px", fontFamily: "monospace", fontWeight: 600 };
    var sMeta = { color: "var(--text-muted, #949ba4)", fontSize: "12px", marginLeft: "8px", fontWeight: 400 };
    var sExpanded = { padding: "12px", background: "var(--background-secondary-alt, #1e1f22)", borderRadius: "6px", marginBottom: "8px" };
    var sActions = { display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" };
    var sBadgeGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "3px", maxHeight: "320px", overflowY: "auto" };
    var sBadge = { display: "flex", alignItems: "center", gap: "8px", padding: "5px 8px", borderRadius: "4px", cursor: "pointer" };
    var sBadgeIcon = { width: "20px", height: "20px", borderRadius: "3px", imageRendering: "crisp-edges" };
    var sBadgeName = { fontSize: "12px", color: "var(--text-normal, #dbdee1)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
    var sBadgeStatus = { fontSize: "10px", fontWeight: 700 };
    var sEmpty = { color: "var(--text-muted, #949ba4)", textAlign: "center", padding: "24px", fontSize: "14px", lineHeight: "1.6" };
    var sSectionTitle = { color: "var(--header-primary, #f2f3f5)", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: "10px" };
    var sHint = { color: "var(--text-muted, #949ba4)", fontSize: "11px", marginTop: "6px", lineHeight: "1.5" };

    return React.createElement("div", { style: sContainer },
        React.createElement("div", { style: sSectionTitle }, "Badge Manager"),
        React.createElement("div", { style: sInputRow },
            React.createElement("input", {
                type: "text",
                placeholder: "Paste Discord User ID...",
                value: inputUserId,
                onChange: function(e) { setInputUserId(e.target.value); },
                onKeyDown: function(e) { if (e.key === "Enter") addUser(); },
                style: sInput
            }),
            React.createElement("button", { onClick: addUser, style: sBtn }, "Manage User")
        ),
        entries.length === 0
            ? React.createElement("div", { style: sEmpty },
                "No users managed yet.",
                React.createElement("br"),
                "Enter a Discord User ID above to start managing their badges."
            )
            : entries.map(function(uid) {
                var config = data[uid];
                var isExpanded = expandedUser === uid;
                var addedCount = config ? config.added.length : 0;
                var removedCount = config ? config.removed.length : 0;

                return React.createElement("div", { key: uid, style: { marginBottom: "8px" } },
                    React.createElement("div", {
                        style: sUserHeader,
                        onClick: function() { setExpandedUser(isExpanded ? null : uid); }
                    },
                        React.createElement("span", null,
                            React.createElement("span", { style: sUserId }, uid),
                            React.createElement("span", { style: sMeta },
                                "(" + addedCount + " added" +
                                (removedCount ? ", " + removedCount + " hidden" : "") + ")"
                            )
                        ),
                        React.createElement("button", {
                            style: sBtnSmall,
                            onClick: function(e) { e.stopPropagation(); removeUser(uid); },
                            title: "Remove user"
                        }, "\u00D7")
                    ),
                    isExpanded && React.createElement("div", { style: sExpanded },
                        React.createElement("div", { style: sActions },
                            React.createElement("button", { style: sBtn, onClick: function() { giveAll(uid); } }, "Give All Badges"),
                            React.createElement("button", { style: sBtnDanger, onClick: function() { removeAll(uid); } }, "Remove All"),
                            React.createElement("button", { style: sBtnGhost, onClick: function() { removeAll(uid); } }, "Reset")
                        ),
                        React.createElement("div", { style: sHint },
                            "Left-click: add/remove fake badge  |  Right-click: hide/show real badge"
                        ),
                        React.createElement("div", { style: sBadgeGrid },
                            availableBadges.map(function(badge) {
                                var isAdded = config && config.added.includes(badge.id);
                                var isRemoved = config && config.removed.includes(badge.id);
                                var bgColor = isAdded
                                    ? "rgba(88, 101, 242, 0.25)"
                                    : isRemoved
                                        ? "rgba(242, 63, 67, 0.15)"
                                        : "transparent";
                                var statusText = isAdded ? "\u2713 ADD" : isRemoved ? "\u2717 HIDE" : "";
                                var statusColor = isAdded ? "#5865f2" : isRemoved ? "#f23f43" : "transparent";

                                return React.createElement("div", {
                                    key: badge.id,
                                    style: Object.assign({}, sBadge, { background: bgColor }),
                                    onClick: function() { toggleAdded(uid, badge.id); },
                                    onContextMenu: function(e) { e.preventDefault(); toggleRemoved(uid, badge.id); },
                                    title: badge.title + "\nClick: " + (isAdded ? "Remove" : "Add") + " | Right-click: " + (isRemoved ? "Unhide" : "Hide")
                                },
                                    React.createElement("img", {
                                        src: "https://cdn.discordapp.com/badge-icons/" + badge.icon + ".png",
                                        style: sBadgeIcon,
                                        alt: ""
                                    }),
                                    React.createElement("span", { style: sBadgeName }, badge.title),
                                    React.createElement("span", { style: Object.assign({}, sBadgeStatus, { color: statusColor }) }, statusText)
                                );
                            })
                        )
                    )
                );
            })
    );
};

// ─── Plugin Definition ──────────────────────────────────────────

export default definePlugin({
    name: "BadgeSelector",
    description: "Customize user badges from settings - add, remove, or hide any Discord badge",
    authors: [
        { id: 1263457746829705310n, name: '.q1' },
        { id: 1147940825330876538n, name: 'Jelly' },
        { id: 1403404140461297816n, name: 'Sami' },
    ],

    settings: definePluginSettings({
        _badgePanel: {
            type: OptionType.COMPONENT,
            description: "Badge Management Panel",
            component: BadgeManagerComponent
        }
    }),

    async start() {
        badgeData = await loadData();

        // Register badge provider using Vencord's Badge API
        // getBadges is called on every profile render, reads from badgeData dynamically
        registeredBadgeRef = {
            id: "badge_selector_provider",
            description: "BadgeSelector Provider",
            // position: 0 = START (add at beginning of badge list)
            position: 0,
            getBadges: function(userInfo) {
                var userId = userInfo.userId;
                var config = badgeData[userId];
                if (!config || !config.added || config.added.length === 0) return [];

                var result = [];
                for (var i = 0; i < config.added.length; i++) {
                    var badgeId = config.added[i];
                    var info = getBadgeInfo(badgeId);
                    if (info) {
                        result.push({
                            id: "bs_" + info.id,
                            description: info.title,
                            iconSrc: "https://cdn.discordapp.com/badge-icons/" + info.icon + ".png",
                            link: info.link,
                            key: "bs_" + info.id,
                            props: {
                                style: { width: "22px", height: "22px", borderRadius: "3px", imageRendering: "crisp-edges" }
                            }
                        });
                    }
                }

                // Add custom badges
                if (config.custom && config.custom.length > 0) {
                    for (var j = 0; j < config.custom.length; j++) {
                        var custom = config.custom[j];
                        result.push({
                            id: "bs_custom_" + custom.id,
                            description: custom.description,
                            iconSrc: custom.icon,
                            link: custom.link,
                            key: "bs_custom_" + custom.id
                        });
                    }
                }

                return result;
            }
        };

        addProfileBadge(registeredBadgeRef);
        console.log("[BadgeSelector] Started - using Badge API for " + Object.keys(badgeData).length + " user(s)");
    },

    stop() {
        if (registeredBadgeRef) {
            removeProfileBadge(registeredBadgeRef);
            registeredBadgeRef = null;
        }
        badgeData = {};
        console.log("[BadgeSelector] Stopped");
    }
});
