Tickets
=======

:total-count: 12

--------------------------------------------------------------------------------

Add support for comments
========================

:bugid: 6
:created: 2025-05-10T15:28:04
:priority: 0

--------------------------------------------------------------------------------

Add support for "followers"
===========================

:bugid: 7
:created: 2025-05-10T15:28:14
:priority: 0

--------------------------------------------------------------------------------

Add NO_AUTH env to disable autticatiion and avoid need for bearerer token
=========================================================================

:bugid: 8
:created: 2025-06-07T01:34:55
:priority: 0

--------------------------------------------------------------------------------

back button
===========

:bugid: 9
:created: 2025-06-17T21:38:13
:priority: 0

--------------------------------------------------------------------------------

Always pass the User object in db APIs
======================================

:bugid: 10
:created: 2025-06-19T01:03:26
:priority: 0

--------------------------------------------------------------------------------

Encryption
==========

:bugid: 11
:created: 2025-06-19T01:18:07
:priority: 0

BLAKE2 + something


For high-performance encryption with pycryptodome that's at least as secure as SPECK, I'd recommend using ChaCha20 or AES in CTR mode. Both offer excellent security and performance characteristics.

Here's an implementation using ChaCha20, which is generally faster than AES on platforms without hardware AES acceleration:

    .. code:
      :lang: python

        from Crypto.Cipher import ChaCha20
        from Crypto.Random import get_random_bytes
        import base64
        import asyncio
        from fastapi import FastAPI, HTTPException
        from pydantic import BaseModel

        app = FastAPI()

        class EncryptRequest(BaseModel):
            plaintext: str

        class EncryptResponse(BaseModel):
            ciphertext: str
            key: str
            nonce: str

        class DecryptRequest(BaseModel):
            ciphertext: str
            key: str
            nonce: str

        async def encrypt_data(data: str, key=None):
            """Encrypt data using ChaCha20 cipher"""
            if key is None:
                key = get_random_bytes(32)  # 256-bit key
            nonce = get_random_bytes(12)    # 96-bit nonce for ChaCha20

            # Offload encryption to thread pool to prevent blocking the event loop
            def _encrypt():
                cipher = ChaCha20.new(key=key, nonce=nonce)
                ciphertext = cipher.encrypt(data.encode('utf-8'))
                return ciphertext

            ciphertext = await asyncio.to_thread(_encrypt)

            return {
                "ciphertext": base64.b64encode(ciphertext).decode('utf-8'),
                "key": base64.b64encode(key).decode('utf-8'),
                "nonce": base64.b64encode(nonce).decode('utf-8')
            }

        async def decrypt_data(ciphertext: str, key: str, nonce: str):
            """Decrypt data using ChaCha20 cipher"""
            try:
                key_bytes = base64.b64decode(key)
                nonce_bytes = base64.b64decode(nonce)
                ciphertext_bytes = base64.b64decode(ciphertext)

                # Offload decryption to thread pool
                def _decrypt():
                    cipher = ChaCha20.new(key=key_bytes, nonce=nonce_bytes)
                    plaintext = cipher.decrypt(ciphertext_bytes)
                    return plaintext.decode('utf-8')

                return await asyncio.to_thread(_decrypt)
            except Exception as e:
                raise ValueError(f"Decryption failed: {str(e)}")

        @app.post("/encrypt", response_model=EncryptResponse)
        async def encrypt_endpoint(request: EncryptRequest):
            return await encrypt_data(request.plaintext)

        @app.post("/decrypt")
        async def decrypt_endpoint(request: DecryptRequest):
            try:
                decrypted = await decrypt_data(request.ciphertext, request.key, request.nonce)
                return {"plaintext": decrypted}
            except ValueError as e:
                raise HTTPException(status_code=400, detail=str(e))

        If you specifically need AES with high performance, use AES in CTR mode:

        ```python
        from Crypto.Cipher import AES
        from Crypto.Random import get_random_bytes
        import base64
        import asyncio
        from fastapi import FastAPI, HTTPException
        from pydantic import BaseModel

        app = FastAPI()

        class EncryptRequest(BaseModel):
            plaintext: str

        class EncryptResponse(BaseModel):
            ciphertext: str
            key: str
            nonce: str

        async def encrypt_data(data: str, key=None):
            """Encrypt data using AES-CTR"""
            if key is None:
                key = get_random_bytes(32)  # 256-bit key
            nonce = get_random_bytes(8)     # 64-bit nonce for CTR mode

            # Offload encryption to thread pool
            def _encrypt():
                cipher = AES.new(key=key, mode=AES.MODE_CTR, nonce=nonce)
                ciphertext = cipher.encrypt(data.encode('utf-8'))
                return ciphertext

            ciphertext = await asyncio.to_thread(_encrypt)

            return {
                "ciphertext": base64.b64encode(ciphertext).decode('utf-8'),
                "key": base64.b64encode(key).decode('utf-8'),
                "nonce": base64.b64encode(nonce).decode('utf-8')
            }
        ```

    Key points about these implementations:

    1. They use `asyncio.to_thread()` to prevent blocking the event loop during cryptographic operations
    2. ChaCha20 is generally faster than AES on CPUs without AES-NI instructions
    3. AES-CTR is very fast on platforms with hardware AES acceleration
    4. Both offer 256-bit security, at least as secure as SPECK
    5. Both are well-studied, standardized algorithms with widespread use

    Choose ChaCha20 for better cross-platform performance or AES-CTR if you know your deployment has AES hardware acceleration.

--------------------------------------------------------------------------------

New backend APIs
================

:bugid: 12
:created: 2025-06-20T21:08:32
:priority: 0



.. note:
    1. "Letters" Feature Endpoints
    This feature allows users to write and receive letters from their past or future selves. All routes must be authenticated.
        • List All of a User's Letters
            ◦ Endpoint: GET /letters
            ◦ Purpose: Fetches all letters belonging to the currently logged-in user.
            ◦ Success Response (JSON): An array of Letter objects.
              JSON
              [{
                "_id": "letter-1",
                "type": "future",
                "content": "Dear Future Me...",
                "mood": 2,
                "target_date": "2025-07-20T10:00:00Z",
                "status": "scheduled",
                "created_at": "2025-06-20T10:00:00Z",
                "opened_at": null,
                "word_count": 50
              }]
        • Create a New Letter
            ◦ Endpoint: POST /letters
            ◦ Request Body (JSON):
              JSON
              {
                "type": "future",
                "content": "A new letter...",
                "targetDate": "2026-01-01",
                "mood": 4
              }
            ◦ Success Response (JSON): The newly created Letter object.
        • Mark a Letter as Opened
            ◦ Endpoint: PUT /letters/{letter_id}/open
            ◦ Purpose: Changes the status of a "future" letter from scheduled to opened.
            ◦ Success Response (JSON): The updated Letter object.
        • Delete a Letter
            ◦ Endpoint: DELETE /letters/{letter_id}
            ◦ Success Response (200 OK): null or { "success": true }.
    2. "Confession Wall" Feature Endpoints
    This feature has unique privacy requirements.
        • List Public Confessions (for the wall)
            ◦ Endpoint: GET /confessions
            ◦ Purpose: Fetches a list of confessions to display on the public wall.
            ◦ IMPORTANT: The backend logic must anonymize the data. If a confession isAnonymous, return the generated soulName. If it's disclosed, return the author's penName. Never return the real authorId on this public route.
            ◦ Success Response (JSON): An array of Confession objects.
              JSON
              [
                { "_id": "conf1", "content": "...", "moodKey": "healing", "soulName": "Wandering Soul", "author": null },
                { "_id": "conf2", "content": "...", "moodKey": "empowered", "soulName": null, "author": { "penName": "BookLovinUser" } }
              ]
        • Create a New Confession
            ◦ Endpoint: POST /confessions
            ◦ Authentication: Required.
            ◦ Request Body (JSON):
              JSON
              {
                "content": "This is a secret thought...",
                "moodKey": "lonely",
                "isAnonymous": true
              }
            ◦ Success Response (JSON): The newly created Confession object.
        • Get a Single Confession
            ◦ Endpoint: GET /confessions/{confession_id}
            ◦ Purpose: Fetches one confession for the detail view page. Must also be anonymized like the list view.
            ◦ Success Response (JSON): A single Confession object.
        • List a User's Own Confessions (Private)
            ◦ Endpoint: GET /me/confessions
            ◦ Authentication: Required.
            ◦ Purpose: Fetches all confessions written by the logged-in user, including anonymous ones, for their private "My Confessions" tab.
            ◦ Success Response (JSON): An array of the user's Confession objects.
    3. "User Profile" Feature Endpoints
    This is needed to view user profiles.
        • Get a User's Public Profile
            ◦ Endpoint: GET /users/{user_id}
            ◦ Purpose: Fetches a user's public profile, including their pen name, bio, and all their public content (posts and disclosed confessions).
            ◦ Success Response (JSON):
              JSON
              {
                "uid": "user_456",
                "penName": "WanderingPoet",
                "bio": "Just sharing my thoughts.",
                "posts": [/* array of Post objects */],
                "confessions": [/* array of disclosed Confession objects */]
              }
        • Update a User's Profile
            ◦ Endpoint: PUT /me/profile
            ◦ Authentication: Required.
            ◦ Request Body (JSON): { "name": "MyNewPenName", "bio": "An updated bio." }
            ◦ Success Response (JSON): The full, updated User object.
    Once these three sets of endpoints are implemented on the backend, your frontend application will be fully operational and all mock data can be removed.
