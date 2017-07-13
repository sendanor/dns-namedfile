# dns-namedfile

Parse and generate configuration files for Bind into JSON.

### Description

This project can be used to parse partial bind (zone) configuration files into JSON and back to 
Bind's configuration file.

***Notice!*** It does not parse RR zone files. Look [dns-zonefile](https://github.com/elgs/dns-zonefile) for that.

### Example usage

This is `zones.json`:

```json
[
   {
      "allowQuery" : [
         "any"
      ],
      "file" : "./zones/example.com.zone",
      "domain" : "example.com",
      "type" : "master"
   },
   {
      "file" : "./zones/example.fi.zone",
      "domain" : "example.fi",
      "type" : "master",
      "allowQuery" : [
         "any"
      ],
      "allowTransfer" : [
         "127.0.0.1",
         "10.1.2.3"
      ]
   }
]
```

And when you do `namedfile -g zones.json > zones.conf`, you will get:

```
zone "example.com" {
type master;
file "./zones/example.com.zone";
allow-query { any; };
};
zone "example.fi" {
type master;
file "./zones/example.fi.zone";
allow-query { any; };
allow-transfer { 127.0.0.1;10.1.2.3; };
};
```

You can also parse `zones.conf` back to JSON with: `namedfile -p zones.conf > zones.json`