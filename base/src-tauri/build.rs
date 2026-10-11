use serde_json::Value;
use std::env;
use url::Url;

fn require_hosted_target() {
    let site_url = env::var("SITE_URL").expect("Set SITE_URL to the hosted HTTPS application");
    let target = Url::parse(&site_url).expect("SITE_URL must be an absolute URL");
    assert_eq!(target.scheme(), "https", "SITE_URL must use HTTPS");
    let host = target.host_str().expect("SITE_URL needs a host");
    assert!(!host.ends_with(".invalid"), "Replace the placeholder SITE_URL");
    let config = env::var("TAURI_CONFIG").expect("Build with the desktop:build command");
    let config: Value = serde_json::from_str(&config).expect("Invalid Tauri build configuration");
    assert_eq!(
        config["build"]["frontendDist"].as_str(),
        Some(site_url.as_str()),
        "The native release target must match SITE_URL"
    );
}

fn main() {
    println!("cargo:rerun-if-env-changed=SITE_URL");
    println!("cargo:rerun-if-env-changed=TAURI_CONFIG");
    if env::var("PROFILE").as_deref() == Ok("release") {
        require_hosted_target();
    }
    tauri_build::build();
}
