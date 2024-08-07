/* eslint-disable */
module.exports = function(grunt){
    "use strict";
    grunt.initConfig({
        copy: {
            main: {
                files: [{
                    expand: true,
                    cwd: "webapp/",
                    src: ["**"],
                    dest: "dist/"
                }]
            }
        },
        gitpull: {
            main: {
                options: {
                    remote: "origin",
                    branch: "master"
                },
                files: {
                    src: ["webapp/**"]
                }
            }
        },
        nwabap_ui5uploader: {
            options: {
                conn: {
                    server: "http://n1t.onprem:1234",
                    client: "010",
                    testMode: false
                },
                auth: {
                    user: "<%= grunt.config('nwdeploy-user') %>",
                    pwd: "<%= grunt.config('nwdeploy-password') %>"
                }
            },
            upload_build: {
                options: {
                    ui5: {
                        package: "/VWKS/NLP_ORDERING_UI",
                        bspcontainer: "/VWKS/NLP_PCTRCENMNG",
                        bspcontainer_text: "Manage Central Purchase Contracts - Adaptation Project",
                        create_transport: false,
                        transport_use_user_match: true,
                        transportno: "<%= grunt.config('nwdeploy-trno') %>"
                    },
                    resources: {
                        cwd: "dist/",
                        src: "webapp.zip"
                    }
                }
            }
        },
        clean: ["dist"],
        prompt: {
            target: {
              options: {
                 questions: [
                    {
                      config: "nwdeploy-user",
                      type: "input",
                      message: "User"
                    },
                    {
                        config: "nwdeploy-password",
                        type: "password",
                        message: "Password"
                      },
                      {
                        config: "nwdeploy-trno",
                        type: "input",
                        message: "Transport No:"
                      }
                  ]
              }
            }
          },
          zip: {
              "using-cwd": {
                  cwd: "dist/",
                  src: ["dist/changes/**/*.*","dist/**/*.js","dist/**/*.xml","dist/**/*.json","dist/*.appdescr_variant","dist/**/*.properties"],
                  dest: "dist/webapp.zip"
              }
          },
          eslint: {
            options: {
                format: require("eslint-html-reporter"),
                outputFile : 'dist/eslint-report.html'
            },
            target: ["webapp/**/*.js"]
        }
    });
    grunt.loadNpmTasks("grunt-eslint");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-git");
    grunt.loadNpmTasks("grunt-nwabap-ui5uploader");
    grunt.loadNpmTasks("grunt-prompt");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-zip");

    grunt.registerTask("deploy",["prompt","copy","zip","nwabap_ui5uploader:upload_build"]);
}