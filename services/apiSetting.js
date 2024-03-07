const supabase = require('../utils/supabase');

exports.getSetting = async function () {
    const { data: settings, error } = await supabase.from("settings").select("*").single();

    console.log({settings});

    if (error) {
        console.error(error);
    }

    return { data: { settings }, error }
}

exports.updateSetting = async function (newSettings) {
    const { data: settings, error } = await supabase.from("settings").update(newSettings).eq("id", 1).single();

    if (error) {
        console.error(error);
    }

    return { data: { settings }, error }
}