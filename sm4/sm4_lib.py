def GET_UINT32_BE(key_data):
    tmp_data = int((key_data[0] << 24) | (key_data[1] << 16) | (key_data[2] << 8) | (key_data[3]))
    return tmp_data
