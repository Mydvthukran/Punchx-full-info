@@
-    const existingRaw = localStorage.getItem('punchx_registered_users');
-    let demoUsers = [
-      { email: 'admin@punchx.com', password: 'PUNCHX^(@)0910' },
-      { email: 'admin@gmail.com', password: 'PUNCHX^(@)0910' },
-      { email: 'demo@gmail.com', password: 'password123' },
-      { email: 'businressguy@gmail.com', password: 'password123' },
-      { email: 'rajesh.ac.expert@gmail.com', password: 'password123' },
-      { email: 'worker@gmail.com', password: 'password123' }
-    ];
+    const existingRaw = localStorage.getItem('punchx_registered_users');
+    let demoUsers = [
+      { email: 'businressguy@gmail.com', password: 'PUNCHX^(@)0910' }
+    ];
@@
-                    onClick={() => {
-                        setSigninEmail('worker.rajesh@gmail.com');
-                        setSigninPassword('PunchX#Worker2026');
-                        showNotification("🔑 Saved Worker credentials populated!");
-                      }}
+                    onClick={() => {
+                        setSigninEmail('businressguy@gmail.com');
+                        setSigninPassword('PUNCHX^(@)0910');
+                        showNotification("🔑 Saved Worker credentials populated!");
+                      }}
