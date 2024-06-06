const supabase = require('../utils/supabase');

exports.getSetting = async function () {
    const { data: settings, error } = await supabase.from("settings").select("*").single();

    if (error) {
        console.error(error);
    }

    return { data: { settings }, error }
}

exports.updateSetting = async function (newSettings) {
    const { data: settings, error } = await supabase
        .from("settings")
        .update(newSettings)
        .eq("id", 1)
        .single()
        .select();

    if (error) {
        console.error(error);
    }

    console.log({ updateSetting: settings });

    return { data: { settings }, error }
}