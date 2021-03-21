#!/usr/bin/env python
def _upload(host, creds, fp):
 
    chunk_size = 64 * 1024
    headers = {
        'Content-Type': 'application/octet-stream'
    }
    fileobj = open(fp, 'rb')
    filename = os.path.basename(fp)
    if os.path.splitext(filename)[-1] == '.iso':
        uri = 'https://%s/mgmt/cm/autodeploy/software-image-uploads/%s' % (host, filename)
    else:
        uri = 'https://%s/mgmt/shared/file-transfer/uploads/%s' % (host, filename)
 
    requests.packages.urllib3.disable_warnings()
    size = os.path.getsize(fp)
    print "The size is ", size;
 
    start = 0
 
    while True:
        file_slice = fileobj.read(chunk_size)
        if not file_slice:
            break
 
        current_bytes = len(file_slice)
        print "current_bytes ", current_bytes
        if current_bytes < chunk_size:
            end = size
        else:
            end = start + current_bytes
 
        content_range = "%s-%s/%s" % (start, end - 1, size)
        print "content_range is ", content_range
        headers['Content-Range'] = content_range
        requests.post(uri,
                      auth=creds,
                      data=file_slice,
                      headers=headers,
                      verify=False)
 
        start += current_bytes
 
 
def _merge_config(host, creds, file):
    requests.packages.urllib3.disable_warnings()
 
    b_url = 'https://%s/mgmt/tm/sys/config' % host
    b = requests.session()
    b.auth = creds
    b.verify = False
    b.headers.update({'Content-Type': 'application/json'})
 
 
    options = {}
    options['file'] = '/var/config/rest/downloads/%s' % file
    options['merge'] = True
 
    payload = {}
    payload['command'] = 'load'
    payload['options'] = [options]
 
    try:
        merge = b.post(b_url, json.dumps(payload))
        if merge.status_code is not 200:
            print "Merge failed, check rest log file"
            exit()
    except Exception, e:
        print e
 
 
def _cleanup_mergefile(host, creds, file):
    requests.packages.urllib3.disable_warnings()
 
    b_url = 'https://%s/mgmt/tm/util/unix-rm' % host
    b = requests.session()
    b.auth = creds
    b.verify = False
    b.headers.update({'Content-Type': 'application/json'})
 
    payload = {}
    payload['command'] = 'run'
    payload['utilCmdArgs'] = '/var/config/rest/downloads/%s' % file
 
    try:
        cleanup = b.post(b_url, json.dumps(payload))
        if cleanup.status_code is not 200:
            print "Cleanup failed, please check system."
    except Exception, e:
        print e
 
 
if __name__ == "__main__":
    import os, requests, json, argparse, getpass
 
    requests.packages.urllib3.disable_warnings()
 
    parser = argparse.ArgumentParser(description='Merge a config file into BIG-IP config')
    parser.add_argument("host", help='BIG-IP IP or Hostname', )
    parser.add_argument("username", help='BIG-IP Username')
    parser.add_argument("filepath", help='Merge file (with Absolute Path)')
    args = vars(parser.parse_args())
 
    hostname = args['host']
    username = args['username']
    filepath = args['filepath']
 
    print "%s, enter your password: " % args['username'],
    password = getpass.getpass()
 
    _upload(hostname, (username, password), filepath)
 
    # filename = os.path.basename(filepath)
    # _merge_config(hostname, (username, password), filename)
    # _cleanup_mergefile(hostname, (username, password), filename)
